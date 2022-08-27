import React, { useRef, useEffect, useState } from 'react';
import Circle from './Circle.js';
import * as Paper from 'paper';
import useWebSocket from './hooks/WebSocketHook.js';
import useControl from './hooks/ControlHook.js';
import useWhiteboard from './hooks/WhiteboardHook.js';
import useUtilityHook from './hooks/UtilityHook.jsx';
import { useControlContext } from './contexts/ControlContext.jsx';
import { useWebSocketContext } from './contexts/WebSocketContext.jsx';

import calculateTextWidth from 'calculate-text-width';

//  create a utility jaascript file with functions of paper as a class maybe (imported here)
// add grid button that turns of an onn with icon
// add zoom button that turns of an onn with icon

// when moving touch the icon button for zoom in changes state
// optimization: use .scale() to scale the trash circle ripple, to be able to decrease the size integer which makes it faster with bigger canvas when zooming out
// fix trash tool when zoomed out, just make it bigger
// add pinching and remove click to zoom, or keep it for unknown devices that dont have mouse or touch (might not work since mobile devie already has pinching)
// icons going crazy in size when switching to phone
// add hold to zoom buttton
// figure out how to make fixed layer
// create background rectangle from Paper.view.bounds
// make algorithm or something that somehow shows the path when being erased if its the same as background or invisible
// make other users unable to erase text that is being typed currently or pencil/ruler paths that arebeing drawn now
// lock unnecessary elements
// selection shows in tex tarea above control
// stop using .getControlData() a lot, make a variable in state and update it when tool changes *
// when reset, reset other things than path to origin
// text origin
// text undo
// when changing the tool, submit text (*)
// see if text moves origin when typing in a different origin and then clicking reset (*)
// change cursor icon
// show hex code in color picker, able to switch from hex to rgb, able to change hex and rgb with input field
// can get item.index
// have substitues locate in main outside of group in the same index it was when it was deleted
// transition opacity when erasing
// logs *
// info button fo things
// remove text area bit showing
// replace all {x: x, y:, y} to Paper.Point(x, y)
// console error when clipboard permission is denied and trying to paste (!)
// see if using blob urls to transfer data in image states when erasing and undoing is better than using raw base64 text (?)
// make undo in the text (*)
// when undoing while holding down eraser, turn all removables back into normal and make it unable to be removed while still down (*)
// make all rasters have an existing copy in the visual layer to prevent delay in loading (*)
// bug with white highlight text not showing correctly, start debugging in console the entire text with line breaks and the highlighted text result (!)
// use .clone()
// use empty items and move the original to visual to substitute when erasing to account for index and also to prevent event blocking
// or figure out another way to do that
// dont append text to layer if it is empty (*)
// when item is erased, create an empty item and MOVE to visual
// resize error
// text between paths returns undefiend
// when creating a text element, create a rect on each line break as to prevent a huge rect that covers the netire thing (*)
// change removable, and removed into a new variable called presence (*)
// removed - removed, can be restored
// removable - will be removed after mouse up, unless undo
// fixed - wont be removed after mouse up, but can become a removable when erasing
// immutable - cant be removed, or become removable
// add grid to essential layer, the pattern is fixed tobe the same size as the screen plus some zoom in factors and is offset by origin
// stop using substitues and just detach the listener (x)
// create a point instead of a path when tapping, actually create two points they connect into one like ruler start (*)
// make removable opacity overlapping a bit lighter
// reference the whole item instead of id, (restorables, text border rectangles)
// create function for find which checks for find index first and consoole error
// send to back method
// fix drag when alt +tabbing (!)
// fix pan after zoom (*)
// limit zoom or other users name size so you can see from afar
// show an arrow facing down to users when zooming from afar
// add option to disable arrows when player is too far or outside screen
// when window changes size, update arrows
// add option to disable path smoothing when zoomed in and wanting more details
// create ruler snapping
const Whiteboard = (props) => {
	const [state, _setState] = useState({
		path: undefined,
		trashing: false,
		selected: [],
		blinkerInterval: null,
		mouse: { x: 0, y: 0 },
		pivot: {},
		origin: { x: 0, y: 0 },
		fixedOrigin: { x: 0, y: 0 },
		tool: 'pencil',
		drag: false,
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const { webSocket } = useWebSocketContext();
	const { control, setControl } = useControlContext();
	const { sendDataToServer, uuid } = useWebSocket();
	const { isMouseOverControl, positionOverRect } = useControl();
	// const { calculateTextWidth } = useWhiteboard();
	const { isMouseEventLeftClick } = useUtilityHook();
	const maxSize = 10;

	const canvas = useRef(null);
	const context = useRef(null);

	const download = useRef(null);

	const submitText = () => {
		setBlinker(false);
		// let hiddenInput = document.querySelector('.hidden-textarea');
		props.hiddenInput.current.input.blur();
		props.hiddenInput.current.set('');
		//
		if (Paper.project.layers.text.children.length < 1) return null;

		let content = Paper.project.layers.text.children[0].children.content;
		let textGroup = Paper.project.layers.text.children[0];

		// log to the console in delict
		if (content.content.trim() === '') {
			Paper.project.layers.text.children[0].remove();
			return null;
		}

		// create group with point text trimmed and an array of rectangles for each line
		new Paper.Group({
			children: [content].concat(
				content.content
					.trim()
					.split('\n')
					.map((line, index) => {
						let rectangle = new Paper.Shape.Rectangle({
							width: calculateTextWidth(line.trimEnd(), `${textGroup.fontSize}px Arial`),
							height: content.fontSize + textGroup.data.highlightPadding,
							fillColor: 'black',
							opacity: 0,
							data: {
								tag: 'text-rectangle',
								presence: 'fixed',
							},
							// selected: true,
						});
						rectangle.bounds.topLeft.set(
							new Paper.Point(content.data.origin.x, textGroup.data.origin.y - textGroup.data.highlightPadding + (content.fontSize + textGroup.data.lineHeight) * index)
						);
						return rectangle;
					})
			),
			data: {
				tag: 'text-group',
				presence: 'fixed',
			},
		});

		textGroup.remove();
	};

	const onReset = () => {
		submitText();

		setState({
			..._state.current,
			origin: { x: 0, y: 0 },
			fixedOrigin: { x: 0, y: 0 },
		});

		Paper.project.view.center = new Paper.Point(Paper.project.view.viewSize.width / 2, Paper.project.view.viewSize.height / 2);
		Paper.project.view.zoom = 1;
	};

	const formatChildren = (children) => {
		return Array.from(children)
			.map((x) => `"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})"`)
			.join(', ');
	};

	const setBlinker = (bool) => {
		if (_state.current.blinkerInterval) clearInterval(_state.current.blinkerInterval);

		if (Paper.project.layers.text.children.length < 1) return null;
		if (bool) {
			Paper.project.layers.text.children[0].children.blinker.opacity = 1;
			return setInterval(() => {
				let blinker = Paper.project.layers.text.children[0].children.blinker;

				blinker.opacity = blinker.opacity == 1 ? 0 : 1;
			}, 600);
		} else {
			Paper.project.layers.text.children[0].children.blinker.opacity = 0;
		}

		return null;
	};

	const logFog = (text = false, network = false) => {
		console.error('');
		console.log(
			`Main layer: ${Array.from(Paper.project.layers.main.children)
				.map(
					(x) =>
						`"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})${
							x.className == 'Group' ? ` [${formatChildren(x.children)}]` : ''
						}"`
				)
				.join(', ')}`
		);
		console.log(
			`Hidden layer: ${Array.from(Paper.project.layers.hidden.children)
				.map(
					(x) =>
						`"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})${
							x.className == 'Group' ? ` [${formatChildren(x.children)}]` : ''
						}"`
				)
				.join(', ')}`
		);
		if (text) {
			console.log(
				`Text layer: ${Array.from(Paper.project.layers.text.children)
					.map(
						(x) =>
							`"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})${
								x.className == 'Group' ? ` [${formatChildren(x.children)}]` : ''
							}"`
					)
					.join(', ')}`
			);
		}
		if (network) {
			console.log(
				`Network layer: ${Array.from(Paper.project.layers.network.children)
					.map(
						(x) =>
							`"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})${
								x.className == 'Group' ? ` [${formatChildren(x.children)}]` : ''
							}"`
					)
					.join(', ')}`
			);
		}
	};

	const undo = () => {
		// submitText(); unnecessary since undo wont work unless there is no active text element
		let layer = Paper.project.layers.main;
		let children = layer.children.filter((child) => child.data != 'essential');
		if (children.length < 1) return;
		let recent = children[children.length - 1];

		let index, path;
		switch (recent.className) {
			case 'Path':
				index = Paper.project.layers.main.children.findIndex((x) => x.id == recent.id);
				Paper.project.layers.main.children.splice(index, 1);

				// to force update the paper project
				path = new Paper.Path();
				path.remove();
				break;
			case 'Raster':
				index = Paper.project.layers.main.children.findIndex((x) => x.id == recent.id);
				Paper.project.layers.main.children.splice(index, 1);

				// remove visual duplicate
				let _index = Paper.project.layers.hidden.children.findIndex((x) => x.data.id == recent.id);
				Paper.project.layers.hidden.children.splice(_index, 1);

				path = new Paper.Path();
				path.remove();
				break;
			case 'Group':
				switch (recent.data.tag) {
					case 'restorable':
						recent.data.children.map((id) => {
							let index = Paper.project.layers.main.children.findIndex((e) => e.id == id);
							if (index < 0) {
								console.error(`Failed to undo item id ${id}, details:`);
								console.error(Paper.project.layers);
								return;
							}

							let item = Paper.project.layers.main.children[index];

							item.data.presence = 'fixed';
							item.opacity = 1;
						});

						index = Paper.project.layers.main.children.findIndex((x) => x.id == recent.id);
						Paper.project.layers.main.children.splice(index, 1);
						break;
					case 'text-group':
						index = Paper.project.layers.main.children.findIndex((x) => x.id == recent.id);
						Paper.project.layers.main.children.splice(index, 1);

						path = new Paper.Path();
						path.remove();
						break;
				}
				break;
		}
	};

	const rgbToHex = (rgb) => {
		let [r, g, b] = rgb;
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};

	// mouse over path, check each segment and check if the distance between the origin and the mouse is less than or equals teh radius which means it is inside it
	//  mouse over tex, check if mouse is inside the rectnalge
	// ruler, idont know

	// current problem, some paths that are hidden are blocking events executingon paths behind them

	const createImage = (source, x, y, callback = null) => {
		let image = new Paper.Raster({
			source: source,
			opacity: 0,
			data: {
				origin: { x: x, y: y },
				presence: 'fixed',
			},
		});

		image.onLoad = () => {
			image.bounds.topLeft.set(Paper.view.viewToProject(new Paper.Point(image.data.origin.x, image.data.origin.y)));
			image.opacity = 1;
			if (callback) callback();

			image.onLoad = undefined;
		};

		return image;
	};

	const createPath = (segments, color, size) => {
		let path = new Paper.Path({
			segments: segments,
			strokeColor: color,
			strokeWidth: size,
			strokeCap: 'round',
			strokeJoin: 'round',
			data: {
				presence: 'fixed',
			},
		});

		return path;
	};

	const onMouseDown = (event) => {
		if (event.touches) {
			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
		}
		if (isMouseOverControl(event.clientX, event.clientY) || !isMouseEventLeftClick(event)) return;

		let _state = {
			// ..._state.current,
			...state,
			drag: true,
		};

		switch (control.tool) {
			case 'zoomin':
				Paper.project.view.zoom += 0.05;
				Paper.project.view.center = new Paper.Point(
					Paper.project.view.center.x - (Paper.project.view.center.x - event.clientX) / 8,
					Paper.project.view.center.y - (Paper.project.view.center.y - event.clientY) / 8
				);
				updateArrows();
				drawGrid();
				break;
			case 'zoomout':
				Paper.project.view.zoom = Math.max(Paper.project.view.zoom - 0.05, 0.01);
				updateArrows();
				drawGrid();
				break;
			case 'pencil':
				_state.path = createPath([Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY))], control.color, control.sizes.pencil);
				break;
			case 'ruler':
				_state.path = createPath([Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY))], control.color, control.sizes.ruler);

				let path = new Paper.Path({
					segments: [Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)), Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY))],
					strokeColor: 'rgba(0,0, 0, 0.2)',
					strokeWidth: 3,
					dashArray: [10, 4],
					data: {
						tag: 'ruler',
						presence: 'fixed',
					},
				});

				Paper.project.layers.visual.addChild(path);
				break;
			case 'hand':
				_state.pivot = Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY));
				break;
			case 'picker':
				Paper.project.layers.essential.children[0].children.background.size = new Paper.Size(Paper.view.bounds.width, Paper.view.bounds.height);
				Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;

				let pixel = context.current.getImageData(event.clientX, event.clientY, 1, 1);
				let rgb = [pixel.data[0], pixel.data[1], pixel.data[2]];

				setControl({
					...control,
					color: rgbToHex(rgb),
				});
				break;
			case 'trash':
				if (state.trashing) break;

				let ripple = new Paper.Shape.Circle({
					center: Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)),
					fillColor: 'white',
				});

				ripple.data = {
					origin: ripple.position,
				};
				let spliceIndex = Paper.project.layers.main.children.length;
				let rippleTime = 500; // milliseconds

				console.log(Paper.view.bounds);

				let mousePos = Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY));
				let distances = [
					Math.hypot(Paper.view.bounds.topLeft.x - mousePos.x, Paper.view.bounds.topLeft.y - mousePos.y),
					Math.hypot(Paper.view.bounds.topRight.x - mousePos.x, Paper.view.bounds.topRight.y - mousePos.y),
					Math.hypot(Paper.view.bounds.bottomRight.x - mousePos.x, Paper.view.bounds.bottomRight.y - mousePos.y),
					Math.hypot(Paper.view.bounds.bottomLeft.x - mousePos.x, Paper.view.bounds.bottomLeft.y - mousePos.y),
				];
				let size = Math.max.apply(Math, distances);

				size = Math.ceil(size);

				let factor = rippleTime / size;
				for (let i = 0; i <= size; i++) {
					setTimeout(() => {
						ripple.radius = i;
					}, i * factor);
				}

				_state.trashing = true;
				// Finishes in "factor * size" milliseconds
				setTimeout(() => {
					Paper.project.layers.main.children = Paper.project.layers.main.children.splice(spliceIndex, Paper.project.layers.main.children.length - 1);

					setState({
						...state,
						trashing: false,
					});
				}, size * factor);
				break;
		}

		setState(_state);
	};

	const onMouseMove = (event) => {
		if (event.touches) {
			event.clientX = event.touches[0].clientX;
			event.clientY = event.touches[0].clientY;
		}

		let _state = {
			...state,
			mouse: { x: event.clientX, y: event.clientY },
		};

		let point = Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY));

		// DONT FORGET
		// sendDataToServer({
		// 	event: 'move',
		// 	id: document.cookie,
		// 	room: window.location.pathname.slice(1),
		// 	position: {
		// 		x: point.x,
		// 		y: point.y,
		// 	},
		// });

		// console.log('yeah');
		if (state.drag) {
			switch (control.tool) {
				case 'pencil':
					state.path.add(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)));
					break;
				case 'hand':
					if (state.trashing) break;

					Paper.project.view.center = Paper.project.view.center.subtract(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)).subtract(state.pivot));

					Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;

					_state.origin = {
						x: state.fixedOrigin.x - (event.clientX - state.pivot.x),
						y: state.fixedOrigin.y - (event.clientY - state.pivot.y),
					};

					updateArrows();
					drawGrid();
					break;
				case 'ruler':
					let path = Paper.project.layers.visual.children.find((path) => path.data.tag == 'ruler');

					path.segments[1].point = Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY));
					break;
			}
		}
		setState(_state);
	};

	// current bug: after making 3 lines, erase two lines from the left, and undo, after that erase two lines from the right, and undo
	// and then erase 2 lines from the left, and undo the and the third line will be deleted
	const onMouseUp = (event) => {
		// if there was no mouse down, which means it is over the control
		if (!state.drag) return;
		if (event.touches) {
			if (event.touches.length > 0) {
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
			} else {
				event.clientX = event.changedTouches[0].clientX;
				event.clientY = event.changedTouches[0].clientY;
			}
		}

		let _state = {
			...state,
			drag: false,
		};

		// console.log(`Before mouse up: ${formatChildren(Paper.project.layers.main.children)}`);

		// var segmentCount = _state.current.path.segments.length;
		switch (control.tool) {
			case 'pencil':
				_state.path.add(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)));

				// to be able to draw points
				if (_state.path.segments.length > 2) _state.path.simplify(10);
				break;
			case 'ruler':
				_state.path.add(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)));

				Paper.project.layers.visual.children.find((path) => path.data.tag == 'ruler').remove();
				break;
			case 'eraser':
				console.log(Paper.project.layers);
				let removable = Paper.project.layers.main.children.filter((path) => path.data.presence == 'removable');
				if (removable.length < 1) break;

				removable.map((item) => {
					item.opacity = 0;
					item.data.presence = 'removed';
				});

				new Paper.Group({
					data: {
						tag: 'restorable',
						presence: 'fixed',
						children: removable.map((item) => item.id),
					},
				});
				break;
			case 'hand':
				if (state.pivot == null) return;
				_state.fixedOrigin = state.origin;
				_state.pivot = null;
				break;
			case 'text':
				if (Paper.project.layers.text.children.length > 0) submitText();

				let fontSize = 24 * Math.max(control.sizes.text / maxSize, 0.25);
				let lineHeight = fontSize / 5.14;
				let highlightPadding = fontSize / 4;

				// create rectangle, create text area at rectangle position
				let textGroup = new Paper.Group({
					children: [
						new Paper.Group({
							children: [],
						}),
						new Paper.PointText({
							point: Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)),
							fillColor: control.color,
							fontFamily: 'Arial',
							fontSize: fontSize,
							data: {
								origin: Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)),
							},
							locked: true,
						}), // content
						new Paper.Shape.Rectangle({
							fillColor: control.color,
							strokeColor: control.color,
							opacity: 0,
						}), // blinker
						new Paper.Group({
							children: [],
						}),
					],
					data: {
						lineHeight: lineHeight,
						highlightPadding: highlightPadding,
						origin: Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)),
					},
				});

				textGroup.children.highlights = textGroup.children[0];
				textGroup.children.content = textGroup.children[1];
				textGroup.children.blinker = textGroup.children[2];
				textGroup.children.highlightText = textGroup.children[3];

				Paper.project.layers.text.addChild(textGroup);

				textGroup.children.content.bounds.topLeft.set(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY)));
				textGroup.children.blinker.opacity = 1;
				textGroup.children.blinker.size = new Paper.Size(fontSize / 160, fontSize + highlightPadding);
				textGroup.children.blinker.bounds.topLeft.set(Paper.view.viewToProject(new Paper.Point(event.clientX, event.clientY - highlightPadding)));

				props.hiddenInput.current.set('');
				props.hiddenInput.current.input.focus();

				_state.blinkerInterval = setBlinker(true);
				break;
		}

		setState(_state);
	};

	const getLineFromSelectionIndex = (selectionIndex, content, linebreak = false, linebreakStart = false) => {
		if (selectionIndex == 0) return 0; // if the selection index is in the first character, it is in the first line

		let linebreaks = content
			.split('')
			.map((element, index) => {
				if (element == '\n') return index;
			})
			.filter((element) => element != undefined)
			.reverse()
			.concat([-1]);

		for (let i = 0; i < linebreaks.length; i++) {
			if (selectionIndex > linebreaks[i]) {
				let line = linebreaks.map((_, index) => index).reverse()[i];
				if (selectionIndex - linebreaks[i] == 1 && linebreak && !linebreakStart) return line - 1;
				return line;
			}
		}
	};

	const onWrite = (event) => {
		if (Paper.project.layers.text.children.length < 1) return;
		if (event.keyCode == 13 && !event.shiftKey) return submitText();

		let text = Paper.project.layers.text.children[0];

		setTimeout(() => {
			let content = event.target.value;

			text.children.content.content = content;

			// get selection data
			let { selectionStart, selectionEnd } = props.hiddenInput.current.input;
			let selection = event.target.value.slice(selectionStart, selectionEnd);

			let line = getLineFromSelectionIndex(selectionStart, content);

			let previousLines = content.split('\n').slice(0, line);

			let blinkerStart = new Paper.Point(
				text.children.content.bounds.leftCenter.x +
					calculateTextWidth(content.split('\n')[line].slice(0, selectionStart - (previousLines.length + previousLines.join('').length)), `${text.children.content.fontSize}px Arial`),
				text.data.origin.y - text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * line
			);

			// add higlights
			if (selection.length > 0) {
				// "t" same length as "\n"
				let lineStart = getLineFromSelectionIndex(selectionStart, content, true, true);
				let lineEnd = getLineFromSelectionIndex(selectionEnd, content, true);
				if (text.children.highlights.children.length < lineEnd - lineStart + 1) {
					let addition = lineEnd - lineStart + 1 - text.children.highlights.children.length;

					for (let i = 0; i < addition; i++) {
						let highlight = new Paper.Shape.Rectangle({
							point: new Paper.Point(text.data.origin.x, text.data.origin.y),
							size: new Paper.Size(0, text.children.content.fontSize + text.data.highlightPadding),
							fillColor: '#3390FF',
							opacity: 0,
						});
						text.children.highlights.addChild(highlight);

						let highlightText = new Paper.PointText({
							point: new Paper.Point(text.data.origin.x, text.data.origin.y),
							fillColor: 'white',
							fontFamily: 'Arial',
							fontSize: text.children.content.fontSize,
							opacity: 0,
						});
						text.children.highlightText.addChild(highlightText);
					}
				}

				text.children.highlights.children.map((highlight) => (highlight.opacity = 0));
				text.children.highlightText.children.map((highlight) => (highlight.opacity = 0));
				for (let i = lineStart; i <= lineEnd; i++) {
					let line = content.split('\n')[i];
					if (i < content.split('\n').length - 1) line += '\n';

					let _previousLines = content.split('\n').slice(0, i);
					let offset = _previousLines.length + _previousLines.join('').length;
					let indices = line.split('').map((_, index) => index + offset);
					// console.log(`rect index: ${i - lineStart}`);
					let highlight = text.children.highlights.children[i - lineStart];
					let highlightText = text.children.highlightText.children[i - lineStart];
					let _content = '';
					let start = false;
					let end = false;
					if (indices.includes(selectionStart)) start = true;
					if (indices.includes(selectionEnd)) end = true;

					// *** make sure this is disabled for last line
					start = start ? selectionStart - offset : 0;
					end = end ? selectionEnd - offset : line.length;
					_content = line.slice(start, end);

					highlight.opacity = 1;
					highlightText.opacity = 1;

					let position = new Paper.Point(
						text.children.content.bounds.leftCenter.x + calculateTextWidth(line.slice(0, start), `${text.children.content.fontSize}px Arial`),
						text.data.origin.y - text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * i
					);

					highlight.size.width = calculateTextWidth(_content.replace('\n', 't'), `${text.children.content.fontSize}px Arial`);
					highlight.bounds.topLeft.set(position);

					highlightText.content = '\n'.repeat(i) + _content;
					highlightText.bounds.topLeft.set(new Paper.Point(position.x, text.data.origin.y));
				}
			} else {
				text.children.highlights.children.map((highlight) => (highlight.opacity = 0));
				text.children.highlightText.children.map((highlight) => (highlight.opacity = 0));
			}

			text.children.blinker.bounds.topLeft.set(blinkerStart);

			// hide blinker if any text is selected
			setState({
				...state,
				blinkerInterval: setBlinker(selection.length < 1),
			});

			text.children.content.bounds.topLeft.set(new Paper.Point(text.data.origin.x, text.data.origin.y));
		}, 0);
		// let index = Paper.project.layers.main.children.findIndex((child) => child.data.tag == 'active');
		// if (index < 0) return;

		// console.log(event.target.value.slice(props.hiddenInput.current.input.selectionStart, props.hiddenInput.current.input.selectionEnd));
		// // console.log(props.hiddenInput.current.input.selectionEnd);
		// let pointText = Paper.project.layers.main.children[index];
		// // pointText.content = event.target.value;
		// pointText.content = props.hiddenInput.current.input.value;
		// console.log(event.target.value);
		// console.log(props.hiddenInput.current.input);
	};

	// const onSubmit = (event) => {
	// 	console.log('submit');
	// };

	const onToolChange = (tool) => {
		if (tool) {
			setState({
				..._state.current,
				tool: tool,
			});
		}
		submitText();
	};

	const onSubmit = () => {};

	props.onMouseDown.current = onMouseDown;
	props.onMouseUp.current = onMouseUp;
	props.onMouseMove.current = onMouseMove;

	props.onReset.current = onReset;
	props.onWrite.current = onWrite;
	props.onSubmit.current = onSubmit;
	props.onToolChange.current = onToolChange;

	function _arrayBufferToBase64(buffer) {
		var binary = '';
		var bytes = new Uint8Array(buffer);
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	}

	// not implemented yet, create another skeleton project for testing
	var drawGrid = () => {};

	const line_intersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
		var ua,
			ub,
			denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
		if (denom == 0) {
			return null;
		}
		ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
		ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
		return {
			x: x1 + ua * (x2 - x1),
			y: y1 + ua * (y2 - y1),
			seg1: ua >= 0 && ua <= 1,
			seg2: ub >= 0 && ub <= 1,
		};
	};

	const angle = (cx, cy, ex, ey) => {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx); // range (-PI, PI]
		theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
		if (theta < 0) theta = 360 + theta; // range [0, 360)
		return theta;
	};

	const getProjectBoundingLines = () => {
		let spacing = 25;
		let boundingLines = [
			[
				new Paper.Point(Paper.project.view.bounds.x + spacing, Paper.project.view.bounds.y + spacing),
				new Paper.Point(Paper.project.view.bounds.x + Paper.project.view.bounds.width - spacing, Paper.project.view.bounds.y + spacing),
			],
			[
				new Paper.Point(Paper.project.view.bounds.x + spacing, Paper.project.view.bounds.y + spacing),
				new Paper.Point(Paper.project.view.bounds.x + spacing, Paper.project.view.bounds.y + Paper.project.view.bounds.height - spacing),
			],
			[
				new Paper.Point(Paper.project.view.bounds.x + spacing, Paper.project.view.bounds.y + Paper.project.view.bounds.height - spacing),
				new Paper.Point(Paper.project.view.bounds.x + Paper.project.view.bounds.width - spacing, Paper.project.view.bounds.y + Paper.project.view.bounds.height - spacing),
			],
			[
				new Paper.Point(Paper.project.view.bounds.x + Paper.project.view.bounds.width - spacing, Paper.project.view.bounds.y + spacing),
				new Paper.Point(Paper.project.view.bounds.x + Paper.project.view.bounds.width - spacing, Paper.project.view.bounds.y + Paper.project.view.bounds.height - spacing),
			],
		];

		return boundingLines;
	};

	const updateArrows = () => {
		Paper.project.layers.network.children
			.filter((e) => e.data.type == 'rect')
			.map((rect) => {
				let tracer = Paper.project.layers.network.children.find((e) => e.data.socket == rect.data.socket && e.data.type == 'tracer');
				if (!tracer) return;

				let insideBounds = rectInPaperBounds(rect.data.origin, rect.children[0].size);

				if (insideBounds) return (tracer.opacity = 0);

				let boundingLines = getProjectBoundingLines();

				for (let [p1, p2] of boundingLines) {
					let result = line_intersect(Paper.project.view.center.x, Paper.project.view.center.y, rect.data.origin.x, rect.data.origin.y, p1.x, p1.y, p2.x, p2.y);

					if (result.seg1 && result.seg2) {
						let deg = angle(rect.data.origin.x + rect.children[0].size.width / 2, rect.data.origin.y + rect.children[0].size.height / 2, result.x, result.y);

						tracer.opacity = 1;
						tracer.position = new Paper.Point(result.x, result.y);
						tracer.rotate(360 - tracer._clipItem.rotation);
						tracer.rotate(deg - 180);
					}
				}
			});
	};

	const rectInPaperBounds = (position, size) => {
		let insideBounds =
			positionOverRect(position.x, position.y, Paper.project.view.bounds) ||
			positionOverRect(position.x + size.width, position.y, Paper.project.view.bounds) ||
			positionOverRect(position.x, position.y + size.height, Paper.project.view.bounds) ||
			positionOverRect(position.x + size.width, position.y + size.height, Paper.project.view.bounds);

		return insideBounds;
	};

	useEffect(() => {
		document.oncontextmenu = (event) => {
			event.preventDefault();
			event.stopPropagation();
		};
		context.current = canvas.current.getContext('2d');

		Paper.setup(canvas.current);

		// have to update the canvas size after running Paper.setup because it incorrectly resizes the canvas, which caused bugs with the color picker
		canvas.current.width = window.innerWidth;
		canvas.current.height = window.innerHeight;

		Paper.project.activeLayer.name = 'essential';
		Paper.project.addLayer(new Paper.Layer({ name: 'grid' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'hidden' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'main' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'network' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'visual' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'text' }));

		// layer hierarchy
		// essential - last, background
		// visual - first, only active when using ruler
		// text - second, only active when typing text
		// network - third, only active when other users are on the screen

		// drawGrid();

		Paper.project.layers.main.activate();

		let group = new Paper.Group({
			children: [
				new Paper.Shape.Rectangle({
					point: new Paper.Point(0, 0),
					size: new Paper.Size(window.innerWidth, window.innerHeight),
					fillColor: 'white',
				}),
			],
		});

		group.children.background = group.children[0];
		group.children.background.bounds.topLeft.set(new Paper.Point(0, 0));

		Paper.project.layers.essential.addChild(group);
	}, []);

	useEffect(() => {
		const handleWheel = (event) => {
			// console.log(event);
			// console.log()
			// console.log(props.switchIndex);
			if (_state.current.tool.includes('zoom')) {
				props.switchIndex.current(event.deltaY < 0 ? 0 : 1);
				//Zoom
				// $(document).ready(function () {
				// $('#myCanvas').on('mousewheel', function (event) {
				var newZoom = Paper.view.zoom;
				var oldZoom = Paper.view.zoom;

				if (event.deltaY <= 0) {
					newZoom = Paper.view.zoom * 1.05;
				} else {
					newZoom = Paper.view.zoom * 0.95;
				}

				var beta = oldZoom / newZoom;

				var mousePosition = new Paper.Point(event.offsetX, event.offsetY);

				//viewToProject: gives the coordinates in the Project space from the Screen Coordinates
				var viewPosition = Paper.view.viewToProject(mousePosition);

				var mpos = viewPosition;
				var ctr = Paper.view.center;

				var pc = mpos.subtract(ctr);
				var offset = mpos.subtract(pc.multiply(beta)).subtract(ctr);

				Paper.view.zoom = newZoom;
				Paper.view.center = Paper.view.center.add(offset);

				Paper.project.layers.essential.children[0].children.background.size = new Paper.Size(window.innerWidth / Paper.view.zoom, window.innerHeight / Paper.view.zoom);
				Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;

				updateArrows();
				drawGrid();
				// event.preventDefault();
				// Paper.view.draw();
				// });
				// });

				//Pan
				// paper.install(window);
				// // Only executed our code once the DOM is ready.

				// window.onload = function () {
				// 	// Get a reference to the canvas object
				// 	var canvas = document.getElementById('myCanvas');
				// 	// Create an empty project and a view for the canvas:
				// 	paper.setup(canvas);

				// 	initGraph();

				// 	// Draw the view now:
				// 	paper.view.draw();

				// 	// Create a simple drawing tool:
				// 	var tool = new Tool();

				// 	// Define a mousedown and mousedrag handler
				// 	tool.onMouseDown = function (event) {};

				// 	tool.onMouseDrag = function (event) {
				// 		var pan_offset = event.point.subtract(event.downPoint);
				// 		paper.view.center = paper.view.center.subtract(pan_offset);
				// 	};

				// 	tool.onMouseUp = function (event) {};
				// };

				// function initGraph() {
				// 	//Add Image
				// 	var raster = new Raster('https://cdn.pixabay.com/photo/2014/06/23/20/58/nature-reserve-375609_960_720.jpg');
				// 	raster.scale(0.5);
				// 	raster.opacity = 0.75;
				// 	raster.position = new Point(600, 300); //paper.view.center;//

				// 	//Add Points randomly sized and randomly colored
				// 	//Add Points randomly sized and randomly colored
				// 	for (var i = 0; i < 1000; i++) {
				// 		addRandomPoint();
				// 	}
				// }

				// function addRandomPoint() {
				// 	var radius = 2.0 * Math.random() + 2.0;

				// 	var randomFillColor = '#000000'.replace(/0/g, function () {
				// 		return (~~(Math.random() * 16)).toString(16);
				// 	});
				// 	var x = Math.random() * paper.view.size.width;
				// 	var y = Math.random() * paper.view.size.height;

				// 	var path = new Path.Circle({
				// 		center: new Point(x, y),
				// 		radius: radius,
				// 		fillColor: randomFillColor,
				// 	});
				// }

				// console.log(event.deltaY / 100);
				// Paper.project.view.zoom += event.deltaY / 1000;
			}
		};

		const handleKeydown = (keyboardEvent) => {
			// If is not repeating, and is Ctrl + V and not writing in text
			if (!keyboardEvent.repeat && Paper.project.layers.text.children.length == 0 && !_state.current.drag && keyboardEvent.keyCode == 86 && keyboardEvent.ctrlKey) {
				// let url = URL.createObjectURL(.clipboardData.files[0]);
				navigator.permissions
					.query({ name: 'clipboard-read' })
					.then((auth) => {
						if (auth.state !== 'denied') {
							navigator.clipboard
								.read()
								.then((data) => {
									// console.log(data);
									let type = null;
									let image = data.find((item) =>
										item.types.some((_type) => {
											if (_type.startsWith('image/')) {
												type = _type;
												return true;
											}
										})
									);

									if (image !== undefined) {
										console.log(image);
										image
											.getType(type)
											.then((result) => {
												result
													.arrayBuffer()
													.then((buffer) => {
														createImage(`data:${type};base64,${_arrayBufferToBase64(buffer)}`, _state.current.mouse.x, _state.current.mouse.y, () => {});
														// let image = createImage(`data:${type};base64,${_arrayBufferToBase64(buffer)}`, _state.current.mouse.x, _state.current.mouse.y, () => {
														// 	let clone = image.clone();
														// 	clone.data.presence = 'immutable';
														// 	clone.data.id = image.id;
														// 	Paper.project.layers.hidden.addChild(clone);
														// 	logFog();
														// });
														console.log(`Successfully acquired image array buffer of length ${buffer.length}`);
													})
													.catch(console.error);
											})
											.catch(console.error);
										console.log(`Successfully acquired image mime type ${type}`);
									} else {
										console.error(`Failed to paste data, couldn't find a clipboard item with type image.`);
										console.log(data);
									}
									// console.log(image);
								})
								.catch(console.error);
							// console.log(auth);
							// console.log();

							// const item = navigat
						} else {
							// make a console error in delict
							console.error('Failed to paste data, clipboard access is denied.');
						}
						// if (auth.state !== 'denied') {
						// 	const item_list = await navigator.clipboard.read();
						// 	let image_type; // we will feed this later
						// 	const item = item_list.find(
						// 		(
						// 			item // choose the one item holding our image
						// 		) =>
						// 			item.types.some((type) => {
						// 				// does this item have our type
						// 				if (type.startsWith('image/')) {
						// 					image_type = type; // store which kind of image type it is
						// 					return true;
						// 				}
						// 			})
						// 	);
						// 	const file = item && (await item.getType(image_type));
						// 	console.log(file);
						// }
					})
					.catch(console.error);

				// console.log(_state.current.mouse);
				// let image = new Paper.Raster({
				// 	source: url,
				// 	data: {
				// 		origin: _state.current.mouse,
				// 	},
				// });

				// image.onLoad = () => {
				// 	image.bounds.topLeft.set(new Paper.Point(image.data.origin.x, image.data.origin.y));
				// };
				// console.log(image.position);
				// console.log(image.bounds.topLeft);
				// console.log(image.size);
				// console.log(image.resolution);
				// console.log(image.resolution);
				// console.log();
			}

			if (keyboardEvent.keyCode == 90 && keyboardEvent.ctrlKey && Paper.project.layers.text.children.length == 0) {
				// dragging and ruler
				// not dragging and ruler
				if (!state.drag) {
					undo();
				} else {
					if (control.tool == 'eraser') {
						console.log('Undo removables');
					}
				}
				// if (!(_state.current.drag && control.tool != 'ruler')) {
				// }
				// actions.clearVisual();
				// let filtered = global.s.filter((x) => x.cookie == undefined);
				// if (filtered.length == 0) return;
				// let  = filtered[filtered.length - 1];
				// socket.emit('undo', .id, document.cookie);
				// actions.undo(.id, undefined);
			}
		};

		const handleResizing = () => {
			canvas.current.width = window.innerWidth;
			canvas.current.height = window.innerHeight;

			setTimeout(() => {
				Paper.project.layers.essential.children[0].children.background.size = new Paper.Size(window.innerWidth / Paper.view.zoom, window.innerHeight / Paper.view.zoom);
				Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;
			}, 0);

			// update the view to prevent glitching when resizing to a bigger size
			Paper.view.viewSize = new Paper.Size(window.innerWidth, window.innerHeight);

			drawGrid();
			updateArrows();
			// context.current.fillStyle = 'black';
			// context.current.fillRect(0, 0, window.innerWidth, window.innerHeight);

			// to update the paper project;
			// let path = new Paper.Path({
			// segments: [new Paper.Point(150, 150), new Paper.Point(300, 300)],
			// });
			// path.remove();
			// Paper.view.draw();
			// update();
		};

		const handlePaperMouseMove = (event) => {
			if (state.drag && control.tool == 'eraser') {
				console.log('erasing');
				Paper.project.hitTest(event.point, {
					segment: true,
					fill: true,
					stroke: true,
					tolerance: 5,
					match: (result) => {
						// console.log(result);
						// make every item in text group fixed and change according to parent
						if (result.item.data.tag != 'restorable' && result.item.data.tag != 'text-group' && result.item.data.presence == 'fixed') {
							if (result.item.data.tag == 'text-rectangle') {
								// console.log(result.item.data);
								let group = result.item.parent;
								if (group.data.presence == 'fixed') {
									// group.children[0].opacity = 0.5;
									group.data.presence = 'removable';
									group.opacity = 0.5;
								}
							} else {
								result.item.data.presence = 'removable';
								result.item.opacity = 0.5;
								// console.log(`Erase ${result.item.className.toLowerCase()}-${result.item.id}`);
							}
						}
					},
				});
			}
		};

		Paper.view.onMouseMove = handlePaperMouseMove;
		window.addEventListener('wheel', handleWheel);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('resize', handleResizing);
		// window.addEventListener('mousedown', onMouseDown);
		// window.addEventListener('mouseup', onMouseUp);
		// window.addEventListener('mousemove', onMouseMove);
		// window.addEventListener('touchstart', onMouseDown);
		// window.addEventListener('touchmove', onMouseMove);
		// window.addEventListener('touchend', onMouseUp);

		return () => {
			Paper.view.onMouseMove = undefined;
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('resize', handleResizing);
			// window.removeEventListener('mousedown', onMouseDown);
			// window.removeEventListener('mouseup', onMouseUp);
			// window.removeEventListener('mousemove', onMouseMove);
			// window.removeEventListener('touchstart', onMouseDown);
			// window.removeEventListener('touchmove', onMouseMove);
			// window.removeEventListener('touchend', onMouseUp);
		};
	}, [state, control]);

	// trashing removes all users
	useEffect(() => {
		// on room data change
		Paper.project.layers.network.activate();

		// console.log('Room change');
		// console.log(Paper.project.layers.network.children.length);
		for (let user of webSocket.room.users) {
			// update rectangle
			let rectIndex = Paper.project.layers.network.children.findIndex((child) => child.data.type == 'rect' && child.data.socket == user.socket);
			let mouseSpacing = 3;
			let rectSpacing = 5;
			let name = user.name.trim() || 'Unnamed';
			if (rectIndex < 0) {
				let group = new Paper.Group({
					children: [
						new Paper.Shape.Rectangle({
							size: new Paper.Size(calculateTextWidth(name, '12px JannaLT') + rectSpacing * 2, 19),
							radius: 7,
							fillColor: '#444444',
						}),
						new Paper.PointText({
							fillColor: 'white',
							fontFamily: 'JannaLT',
							fontSize: 12,
							content: name,
						}),
					],
					data: { type: 'rect', socket: user.socket, origin: new Paper.Point(user.position.x, user.position.y) },
					// point: new Paper.Point(user.position.x, user.position.y),
				});

				Paper.project.layers.network.importSVG('tracer-arrow-32.svg', {
					onLoad: (item) => {
						item.data = { type: 'tracer', socket: user.socket };
						item.opacity = 0;

						// console.log(item.rotation);
						// setTimeout(function () {
						// 	console.log('hey');
						// 	item.rotate(180);
						// 	console.log(item._clipItem.rotation);
						// }, 1000);
					},
				});

				group.children[1].bounds.leftCenter.set(new Paper.Point(rectSpacing, 19 / 2));
				// group.bounds.topLeft.set(new Paper.Point(500, 500));
				// console.log(group.bounds.topLeft);
				group.bounds.topLeft.set(new Paper.Point(user.position.x + mouseSpacing, user.position.y + mouseSpacing));
			} else {
				// logFog(false, true);
				// console.log(Paper.project.layers.network.children);
				// console.log(Paper.project.layers.network.children);
				let rect = Paper.project.layers.network.children[rectIndex];
				rect.children[0].size = new Paper.Size(calculateTextWidth(name, '12px JannaLT') + rectSpacing * 2, 19);
				rect.children[1].content = name;

				rect.children[0].bounds.topLeft.set(new Paper.Point(0, 0));
				rect.children[1].bounds.leftCenter.set(new Paper.Point(rectSpacing, 19 / 2));
				// rect.children[1].bounds.leftCenter.set(new Paper.Point(rectSpacing, 19 / 2));
				rect.bounds.topLeft.set(new Paper.Point(user.position.x + mouseSpacing, user.position.y + mouseSpacing));
				rect.data.origin = new Paper.Point(user.position.x, user.position.y);

				let arrow = Paper.project.layers.network.children.find((child) => child.data.type == 'tracer' && child.data.socket == user.socket);
				if (arrow) {
					// check if all corners of the rectangle are outside the screen, then show the arrow
					let insideBounds = rectInPaperBounds(new Paper.Point(user.position.x, user.position.y), rect.children[0].size);

					if (!insideBounds) {
						// check line of intersection between user position and project origin
						// console.log(`${user.name} is outside bounds`);

						let boundingLines = getProjectBoundingLines();

						for (let [p1, p2] of boundingLines) {
							let result = line_intersect(Paper.project.view.center.x, Paper.project.view.center.y, user.position.x, user.position.y, p1.x, p1.y, p2.x, p2.y);

							if (result.seg1 && result.seg2) {
								let deg = angle(user.position.x + rect.children[0].size.width / 2, user.position.y + rect.children[0].size.height / 2, result.x, result.y);

								arrow.opacity = 1;
								arrow.position = new Paper.Point(result.x, result.y);
								arrow.rotate(360 - arrow._clipItem.rotation);
								arrow.rotate(deg - 180);
							}
						}
					} else {
						arrow.opacity = 0;
					}
				}
			}

			// update arrow
			// const refreshCanvases = () => {
			// 	Array.from(document.querySelectorAll('.canvas')).map((canvas) => {
			// 		canvas.width = window.innerWidth;
			// 		canvas.height = window.innerHeight;
			// 	});

			// 	if (typeof actions !== 'undefined') {
			// 		actions.refresh();
			// 	}

			// 	Array.from(document.querySelector('.players').children).map((player) => {
			// 		let position = {
			// 			x: parseInt(player.style.left.split('px')[0]),
			// 			y: parseInt(player.style.top.split('px')[0]),
			// 		};

			// 		let cookie = player.getAttribute('alt');

			// 		if (position.x > window.innerWidth || position.y > window.innerHeight) {
			// 			let indicator = Array.from(indicators.children).find((x) => x.getAttribute('alt') == cookie);
			// 			if (indicator == undefined) indicator = createIndicator(cookie);

			// 			let dataPosition = {
			// 				x: position.x.clamp(50, window.innerWidth) - 50,
			// 				y: position.y.clamp(50, window.innerHeight) - 50,
			// 			};

			// 			indicator.style.left = `${dataPosition.x}px`;
			// 			indicator.style.top = `${dataPosition.y}px`;
			// 			indicator.style.transform = `rotate(${angle(global.position.x, global.position.y, dataPosition.x, dataPosition.y)}deg)`;

			// 			indicator.style.opacity = '1.0';
			// 		} else {
			// 			let indicator = Array.from(indicators.children).find((x) => x.getAttribute('alt') == cookie);
			// 			if (indicator == undefined) indicator = createIndicator(cookie);

			// 			indicator.style.opacity = '0.0';
			// 		}
			// 	});
			// };

			// 	console.log(`${user.socket} ${JSON.stringify(user.position)}`);
			// 	if (rectIndex < 0) {
			// 		console.log(`${user.socket} has no object`);

			// 		let rectangle = new Paper.Shape.Rectangle({
			// 			point: new Paper.Point(user.position.x, user.position.y),
			// 			data: user.socket,
			// 			fillColor: 'black',
			// 		});
			// 	} else {
			// 		let copy = Paper.project.layers.network.children[rectIndex].clone();
			// 		copy.position = new Paper.Point(user.position.x, user.position.y);
			// 	}
			// 	// console.log(user);
		}

		Paper.project.layers.main.activate();
		// console.log(users);
	}, [webSocket.room]);

	// useEffect(() => {
	// 	submitText();
	// }, [control.latestAction]);

	return (
		<div>
			<a
				style={{
					visiblity: 'hidden',
					pointerEvents: 'none',
				}}
				download='image.jpg'
				className='download-anchor'
				ref={download}
			/>

			{/* <div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
				}}
			>
				adfkjalkdfjkladfj
			</div> */}

			<canvas
				style={{
					height: '100%',
					width: '100%',
					position: 'absolute',
					left: 0,
					top: 0,
					pointerEvents: 'none',
					zIndex: 0,
				}}
				className='main-canvas'
				ref={canvas}
			/>
			{/* 
			<svg
				ref={cursor}
				style={{
					position: 'fixed',
					display: 'none',
					top: state.cursor.position.y,
					left: state.cursor.position.x,
				}}
				width={state.cursor.size}
				height={state.cursor.size}
			>
				<circle cx={state.cursor.size / 2} cy={state.cursor.size / 2} r={state.cursor.size / 2} fill={'rgba(255, 0, 0, 0.5)'}></circle>
			</svg> */}
			{/* <Circle ref={cursor} size={state.cursorSize} /> */}
		</div>
	);
};

export default Whiteboard;
