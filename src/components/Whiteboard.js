import React, { useRef, useEffect, useState } from 'react';
import Circle from './Circle.js';
import * as Paper from 'paper';

// add grid button that turns of an onn with icon
// add zoom button that turns of an onn with icon

// make algorithm or something that somehow shows the path when being erased if its the same as background or invisible
// make other users unable to erase text that is being typed currently or pencil/ruler paths that arebeing drawn now
// lock unnecessary elements
// selection shows in tex tarea above control
// stop using .getControlData() a lot, make a variable in state and update it when tool changes
// when reset, reset other things than path to origin
// text origin
// text undo
// whe ntoo l cahgne text goooo
// see if text moves origin when typing in a different origin and then clicking reset
// change cursor icon
// show hex code in color picker, able to switch from hex to rgb, able to change hex and rgb with input field
// can get item.index
// have substitues locate in main outside of group in the same index it was when it was deleted
// transition opacity when erasing
// logs
// info button fo things
// remove text area bit showing
// replace all {x: x, y:, y} to Paper.Point(x, y)
// console error when clipboard permission is denied and trying to paste
// see if using blob urls to transfer data in image states when erasing and undoing is better than using raw base64 text
// make undo in the text
// when undoing while holding down eraser, turn all removables back into normal and make it unable to be removed while still down
// make all rasters have an existing copy in the visual layer to prevent delay in loading
// bug with white highlight text not showing correctly, start debugging in console the entire text with line breaks and the highlighted text result
// use .clone()
// use empty items and move the original to visual to substitute when erasing to account for index and also to prevent event blocking
// or figure out another way to do that
// dont append text to layer if it is empty
// when item is erased, create an empty item and MOVE to visual
// resize error
// text between paths returns undefiend
// when creating a text element, create a rect on each line break as to prevent a huge rect that covers the netire thing
// change removable, and removed into a new variable called presence
// removed - removed, can be restored
// removable - will be removed after mouse up during erasing, unless undo
// fixed - wont be removed after mouse up, but can become a removable when erasing
// immutable - cant be removed, or become removable
// add grid to essential layer, the pattern is fixed tobe the same size as the screen plus some zoom in factors and is offset by origin
// stop using substitues and just detach the listener
// create a point instead of a path when tapping, actually create two points they connect into one like ruler start
// make removable opacity overlapping a bit lighter
// reference the whole item instead of id, (restorables, text border rectangles)
// create function for find which checks for find index first and consoole error
// send to back method
const Whiteboard = (props) => {
	const [state, _setState] = useState({
		path: undefined,
		drag: false,
		trashing: false,
		selected: [],
		blinkerInterval: null,
		mouse: { x: 0, y: 0 },
		// visualPosition: {
		// 	x: 0,
		// 	y: 0,
		// },
		pivot: {},
		origin: { x: 0, y: 0 },
		fixedOrigin: { x: 0, y: 0 },
		tool: 'pencil',
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const maxSize = 10;

	const canvas = useRef(null);
	const context = useRef(null);

	const download = useRef(null);

	const uuid = () => Date.now().toString() + Math.floor(Math.random(1, 9) * 1000000).toString();
	const isMouseOverControl = (x, y) => props.isMouseOverControl.current(x, y);
	const getControlData = () => props.getControlData.current();
	const changeControlColor = (color) => props.changeControlColor.current(color);
	const isEventLeftClick = (event) => {
		if ('buttons' in event) return event.buttons === 1;
		if ('button' in event) return event.button === 1;
		if ('which' in event) return event.which === 1;
	};

	const submitText = () => {
		setBlinker(false);
		props.hiddenInput.current.input.blur();
		props.hiddenInput.current.set('');
		//
		if (Paper.project.layers.text.children.length < 1) return null;

		let content = Paper.project.layers.text.children[0].children.content;
		let textGroup = Paper.project.layers.text.children[0];
		// console.log(content.data);

		// log to the console in delict
		if (content.content.trim() === '') {
			Paper.project.layers.text.children[0].remove();
			return null;
		}

		// console.log(content);

		// console.log(Array.from(Paper.project.layers.text.children));
		// console.log(Array.from(Paper.project.layers.main.children));
		// let compoundPath = new Paper.CompoundPath({
		// 	children: ,
		// });

		// create group with point text trimmed and an array of rectangles for each line
		new Paper.Group({
			children: [content].concat(
				content.content
					.trim()
					.split('\n')
					.map((line, index) => {
						let rectangle = new Paper.Shape.Rectangle({
							width: calculateTextWidth(line.trimEnd(), textGroup.fontSize),
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

		// add group reference in each rectangle
		// group.children.slice(1, group.children.length).map((rectangle) => {
		// rectangle.data.group = group;
		// rectangle.onMouseEnter = () => onItemErase.bind(group)();
		// rectangle.onMouseMove = () => onItemErase.bind(group)();
		// });

		// compoundPath.onMouseEnter = () => {
		// 	console.log('yeah');
		// };
		// compoundPath.onMouseMove = () => {
		// 	console.log('yeah');
		// };

		// new Paper.Group({
		// 	children: [compoundPath, content],
		// 	data: {
		// 		tag: 'text',
		// 		presence: 'fixed',
		// 	},
		// });

		// console.log(group);
		// console.log(content.fontSize);
		// console.log(textGroup.data.origin);
		// console.log(content.data.origin);
		// console.log(group.children[0].position);
		// console.log(group.children[0].size);

		// let text = createText(textGroup.data.origin.x, textGroup.data.origin.y, content.fontSize, content.fillColor, content.content);
		// text.data = content.data;

		// Paper.project.layers.main.children.push(content);

		// let text = content.clone();

		// let text = new Paper.PointText({
		// 	point: new Paper.Point(, y),
		// 	fillColor: content.fillColor,
		// 	fontFamily: 'Arial',
		// 	fontSize: content.fontSize,
		// 	content: content.content,
		// 	data: content.data,
		// });

		// text.bounds.topLeft.set(new Paper.Point(x, y));

		// Paper.project.layers.main.addChild(text);
		// console.log('foobar');
		// console.log(Paper.project.layers.main.children);
		// Paper.project.layers.main.addChild(createPaper.project.layers.text.children[0].children.content);
		// Paper.project.layers.text.children[0].children.content.remove();
		textGroup.remove();

		logFog(true);
		// console.log(Paper.project.layers.main.children);
		// console.log(Paper.project.layers.text.children);
		// Paper.project.layers.text.children[0].remove();
	};

	const onReset = () => {
		submitText();

		setState({
			..._state.current,
			origin: { x: 0, y: 0 },
			fixedOrigin: { x: 0, y: 0 },
		});
		// __state.origin = {
		// x: _state.current.fixedOrigin.x + (event.clientX - _state.current.pivot.x),
		// y: _state.current.fixedOrigin.y + (event.clientY - _state.current.pivot.y),
		// };

		Paper.project.view.center = new Paper.Point(Paper.project.view.viewSize.width / 2, Paper.project.view.viewSize.height / 2);

		// Paper.project.layers.main.children.map((child) => {
		// 	switch (child.className) {
		// 		case 'Path':
		// 			// if (!child.data.origin) child.data.origin = child.position;
		// 			// if (!child.data.origin) child.data.origin = child.position;

		// 			// console.log(child);
		// 			// child.position = new Paper.Point(child.data.origin.x + __state.origin.x, child.data.origin.y + __state.origin.y);
		// 			child.position = new Paper.Point(child.data.origin.x, child.data.origin.y);
		// 			// console.log(child);
		// 			break;
		// 	}
		// });
		console.log('reset');
	};

	const onDownload = () => {
		download.current.href = canvas.current.toDataURL();
		download.current.click();
	};

	const formatChildren = (children) => {
		return Array.from(children)
			.map((x) => `"${x.className.toLowerCase().includes('text') ? 'text' : x.className.toLowerCase()}-${x.id} (${x.data.tag || ''}) (${x.data.presence || ''})"`)
			.join(', ');
	};

	const logFog = (text = false) => {
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
	};

	const calculateTextWidth = (text, size) => {
		context.current.font = `${size}px Arial`;
		return context.current.measureText(text).width;
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

	const undo = () => {
		// submitText(); unnecessary since undo wont work unless there is no active text element
		let layer = Paper.project.layers.main;
		let children = layer.children.filter((child) => child.data != 'essential');
		if (children.length < 1) return;
		let recent = children[children.length - 1];

		// console.log(Array.from(Paper.project.layers.main.children));
		let index, path;
		switch (recent.className) {
			case 'Path':
				// console.log(`Undoing Path: ${recent.id}`);
				// console.log(recent);

				// let childrenCopy = Array.from(Paper.project.layers.main.children);

				// index = childrenCopy.findIndex((x) => x.id == recent.id);
				// childrenCopy.splice(index, 1);
				index = Paper.project.layers.main.children.findIndex((x) => x.id == recent.id);
				Paper.project.layers.main.children.splice(index, 1);

				// Paper.project.view.update();
				// Paper.project.layers.main.view.update();

				// to force update the paper project
				path = new Paper.Path();
				path.remove();
				// Paper.view.draw();

				// Paper.project.layers.main.children[].selected = true;
				// Paper.project.layers.main.children[0].selected = false;
				// console.log(childrenCopy);

				//
				// recent.remove();

				// if(children.length)
				// Paper.project.view.update();
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
						console.log(`Restoring group-${recent.id}`);
						// console.log(`Undoing Group: ${recent.id}`);
						// console.log(children);
						// **********************************************************************

						// let children = recent.children
						// children.map((path) => {

						// console.log(recent.children);
						recent.data.children.map((id) => {
							let index = Paper.project.layers.main.children.findIndex((e) => e.id == id);
							if (index < 0) {
								console.error(`Failed to undo item id ${id}, details:`);
								console.error(Paper.project.layers);
								return;
							}

							let item = Paper.project.layers.main.children[index];

							// console.log(item.className);
							// if (item.className == 'Raster') {
							// 	let immutable = Paper.project.layers.main.children.find((x) => x.id == item.data.id);

							// 	immutable.source = item.source;
							// 	immutable.data.presence = 'fixed';
							// 	item.data.presence = 'immutable';
							// } else {
							// remove substitues
							// Paper.project.layers.main.children.splice(
							// Paper.project.layers.main.children.findIndex((x) => x.data.id == id),
							// 1
							// );

							// console.log(`Found ${item.className == 'PointText' ? 'text' : item.className.toLowerCase()}-${item.id} at index ${index}`);
							// logFog();
							item.data.presence = 'fixed';
							item.opacity = 1;

							// move item back from hidden to main
							// Paper.project.layers.main.children.splice(item.data.index, 0, item);
							// remove the duplicate back in hidden
							// Paper.project.layers.hidden.children.splice(index, 1);
							// }

							// item.segments = item.data.segments;

							// console.log(`Removed path-${_item.id}`);
							logFog();

							// switch (item.className) {
							// 	case 'Path':
							// 		// let path = createPath(_item.segments, _item.strokeColor, _item.strokeWidth, _item.data.index);
							// 		// console.log(_item.data);
							// 		// path.data.tag = '';
							// 		// path.opacity = 1;

							// 		// console.log(path.strokeColor);
							// 		// console.log(path.strokeWidth);
							// 		// console.log(path.segments);
							// 		// console.log(path.position);
							// 		// console.log(path.data);
							// 		// console.log(path.opacity);

							// 		// _item.opacity = 1;
							// 		// _item.data.tag = '';

							// 		// Paper.project.layers.main.children.splice(_item.data.index, 0, _item);

							// 		// Paper.project.layers.main.children.splice(path.index, 1);
							// 		// Paper.project.layers.main.children.splice(_item.data.index, 0, path);

							// 		// _item.remove();
							// 		// Paper.project.layers.hidden.children.splice(index, 1);

							// 		// item.position = new Paper.Point(item.data.origin.x + _state.current.origin.x, item.data.origin.y + _state.current.origin.y);
							// 		item.data.tag = '';
							// 		item.opacity = 1;

							// 		Paper.project.layers.main.children.splice(item.data.index, 0, item);
							// 		Paper.project.layers.hidden.children.splice(index, 1);
							// 		// item.segments = item.data.segments;

							// 		// console.log(`Removed path-${_item.id}`);
							// 		logFog();

							// 		// Paper.project.layers.main.children.splice(_item.data.index, 0, _item);
							// 		// _item.data.tag = '';
							// 		// _item.opacity = 1;
							// 		// console.log(path);
							// 		// path.data.tag = '';
							// 		// path.opacity = 1;

							// 		// path.remove();

							// 		// _item.data.tag = 'removed';

							// 		// path.data.tag = 'removed';

							// 		// console.log(_item.data);
							// 		// console.log
							// 		// Paper.project.layers.main.children.splice(item.data.index, 0, item);
							// 		// item.position = new Paper.Point(item.data.origin.x + _state.current.origin.x, item.data.origin.y + _state.current.origin.y);
							// 		// item.data.tag = '';
							// 		// tag: '',
							// 		// origin: item.position,
							// 		// };
							// 		// item.opacity = 1;
							// 		console.log('Restored erased path');
							// 		break;
							// 	case 'PointText':
							// 		console.log(item.data);
							// 		// Paper.project.layers.main.children.splice(item.data.index, 0, item);
							// 		item.bounds.topLeft.set(new Paper.Point(item.data.origin.x + _state.current.origin.x, item.data.origin.y + _state.current.origin.y));
							// 		item.data.tag = '';
							// 		item.opacity = 1;
							// 		item.content = item.data.content;

							// 		// tag: '',
							// 		// origin: item.position,
							// 		// };
							// 		console.log('Restored erased pointText');
							// 		break;
							// }

							// console.log(item);
						});

						// console.log(Paper.project.layers.main.children);
						// Paper.project.layers.main.children = Paper.project.layers.main.children.concat(children);
						// children.map((path) => {
						// console.log(path);
						// });

						// Paper.rp
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
		console.log('After undo:');
		logFog();
	};

	const rgbToHex = (rgb) => {
		let [r, g, b] = rgb;
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};

	// mouse over path, check each segment and check if the distance between the origin and the mouse is less than or equals teh radius which means it is inside it
	//  mouse over tex, check if mouse is inside the rectnalge
	// ruler, idont know

	// current problem, some paths that are hidden are blocking events executingon paths behind them

	const onItemErase = function (event) {
		// The mouse is over the item
		// The tool is an eraser
		// The mouse is down
		// The item is not removable, removed or immutable
		// console.log()
		console.log(`Erase ${this.className.toLowerCase()}-${this.id}`);
		if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable', 'immutable'].includes(this.data.presence)) {
			// console.log(`Erase ${this.className.toLowerCase()}-${this.id}`);
			// When the mouse enters / is moving over, move a copy of the path to the hidden layer and hide the segments of the main path to prevent events overlapping
			console.log(this);
			console.log(new Paper.Path());

			this.onMouseEnter = undefined;
			this.onMouseMove = undefined;
			delete this._callbacks;

			this.opacity = 0.5;
			this.data.presence = 'removable';

			logFog();

			// logFog();
			// console.log(this)
			// Clone item to remove event listeners. (Cloned at the same index + 1)
			// console.log(this._callbacks);
			// console.log(this);
			// console.log(new Paper.Path());
			// let clone = this.clone();
			// clone.data.presence = 'removable';
			// clone.data.index =

			// this.remove();
			// Paper.project.layers.hidden.addChild(this);

			// logFog();

			// logFog();

			// clone item to remove listeners
			// move the old item to hidden layer
			// change cloned item opacity to 0.5
			// remove data of previous item

			// this.data.presence = 'removable';
			// this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);
			// // this.data.segments = Array.from(this.segments);
			// // this.segments = [];
			// this.opacity = 0.5;

			// console.log(`Set path-${this.id} to removable at index ${this.data.index}`);
			// logFog();

			// // this.segments = [];
			// // if(Paper.project.layers.main.children.includes

			// console.log(`Created subtitute`);
			// // clone the item here ***** and change tag to substtitue and id to this.id

			// let substitute = new Paper.Group({
			// 	data: {
			// 		tag: 'substitute',
			// 		presence: 'fixed',
			// 		id: this.id,
			// 	},
			// 	// index: this.data.index,
			// });

			// logFog();

			// console.log(`Moved to hidden`);
			// Paper.project.layers.hidden.children.push(this);
			// logFog();

			// console.log(`Removed duplicate in main`);
			// Paper.project.layers.main.children.splice(this.data.index, 1);
			// logFog();

			// // subs
			// console.log(`Removed substitute`);
			// // substitute.remove();
			// Paper.project.layers.main.children.splice(
			// 	Paper.project.layers.main.children.findIndex((x) => x.data.id == this.id),
			// 	1
			// );
			// logFog();

			// console.log(`Moved substitute to index`);
			// // substitute.insertBelow(Paper.project.layers.main.children[this.data.index + 1]);
			// Paper.project.layers.main.children.splice(this.data.index, 0, substitute);

			// // Paper.project.layers.main.children.splice(this.data.index, 0, substitute);

			// // let path = createPath(this.data.segments, this.strokeColor, this.strokeWidth);
			// // path.opacity = 0.5;
			// // path.data.tag = 'visual';

			// // logFog();
			// // console.log(`Added path-${this.id} to hidden, ${Paper.project.layers.hidden.children.findIndex((x) => x.id == this.id) > -1 ? 'confirmed' : 'not confirmed'}`);

			// // let pathIndex = Paper.project.layers.main.children.findIndex((x) => x.id == path.id);
			// // if (pathIndex > -1) {
			// // 	logFog();
			// // 	console.log(`Found path-${path.id} in main, should be in hidden`);
			// // 	Paper.project.layers.main.children.splice(pathIndex, 1);
			// // 	console.log(`Splicing path-${path.id} at index ${pathIndex} in main`);
			// // }
			// logFog();
			// path.onMouseEnter = undefined;
		}
		// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
		// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
		// console.log(Paper.project.layers.main.children);
		// console.log(Paper.project.layers.hidden.children);
	};

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
			image.bounds.topLeft.set(new Paper.Point(image.data.origin.x, image.data.origin.y));
			image.opacity = 1;
			if (callback) callback();

			image.onLoad = undefined;
		};

		// const func = function (event) {
		// 	// if (this.data.tag != 'removed') {
		// 	// 	console.log('Path Enter');
		// 	// }
		// 	// either removed or removable
		// 	if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable', 'visual'].includes(this.data.tag)) {
		// 		logFog();
		// 		// When the mouse enters / is moving over, move a copy of the path to the hidden layer and hide the segments of the main path to prevent events overlapping

		// 		this.data.tag = 'removable';
		// 		this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);

		// 		// see if this method is efficient, try positioning to an off-screen canvas, etc.
		// 		this.data.source = this.source.toString();
		// 		this.source = '';
		// 		// this.data.content = this.content.toString();
		// 		// this.content = '';
		// 		// this.segments = [];
		// 		// this.opacity = 0.5;

		// 		console.log(`Set raster-${this.id} to removable at index ${this.data.index}`);
		// 		logFog();

		// 		// this.segments = [];
		// 		// if(Paper.project.layers.main.children.includes

		// 		// let path = createText(this.data.segments, this.strokeColor, this.strokeWidth);
		// 		// let image = createImage(this.data.source, this.data.origin.x + _state.current.origin.x, this.data.origin.y + _state.current.origin.y, () => {
		// 		// image.opacity = 0.5;
		// 		// });
		// 		// image.data.tag = 'visual';
		// 		let visual = Paper.project.layers.hidden.children.find((child) => child.data.id == this.id);
		// 		visual.opacity = 0.5;
		// 		// console.log(visual.source);
		// 		// console.log(visual.opacity);
		// 		console.log(visual.position);
		// 		// console.log(visual.size);
		// 		// Paper.project.layers.hidden.children.push(image);
		// 		// logFog();
		// 		// console.log(`Added path-${this.id} to hidden, ${Paper.project.layers.hidden.children.findIndex((x) => x.id == this.id) > -1 ? 'confirmed' : 'not confirmed'}`);

		// 		// let imageIndex = Paper.project.layers.main.children.findIndex((x) => x.id == image.id);
		// 		// if (imageIndex > -1) {
		// 		// 	logFog();
		// 		// 	console.log(`Found raster-${image.id} in main, should be in hidden`);
		// 		// 	Paper.project.layers.main.children.splice(imageIndex, 1);
		// 		// 	console.log(`Splicing raster-${image.id} at index ${imageIndex} in main`);
		// 		// }
		// 		logFog();
		// 		// path.onMouseEnter = undefined;
		// 	}
		// 	// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
		// 	// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
		// 	// console.log(Paper.project.layers.main.children);
		// 	// console.log(Paper.project.layers.hidden.children);
		// };

		const onImageErase = function () {
			// if (this.data.tag != 'removed') {
			// 	console.log('Path Enter');
			// }
			// either removed or removable
			if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable', 'immutable'].includes(this.data.presence)) {
				logFog();
				// When the mouse enters / is moving over, move a copy of the path to the hidden layer and hide the segments of the main path to prevent events overlapping
				let visual = Paper.project.layers.hidden.children.find((child) => child.data.id == this.id);

				this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);

				this.data.presence = 'immutable';
				visual.data.presence = 'removable';

				// this.data.segments = Array.from(this.segments);
				// this.segments = [];
				// this.opacity = 0;

				// remove source to disappear
				this.source = '';

				// console.log(Paper.project.layers.hidden.children.map((child) => child.data));

				visual.opacity = 0.5;
				// this.opacity = 0.5;

				console.log(`Set path-${this.id} to removable at index ${this.data.index}`);
				logFog();

				// this.segments = [];
				// if(Paper.project.layers.main.children.includes

				// console.log(`Created subtitute`);
				// let substitute = new Paper.Group({
				// 	data: {
				// 		tag: 'substitute',
				// 		presence: 'fixed',
				// 		id: this.id,
				// 	},
				// 	// index: this.data.index,
				// });

				// logFog();

				// console.log(`Moved to hidden`);
				// Paper.project.layers.hidden.children.push(this);
				// logFog();

				// console.log(`Removed duplicate in main`);
				// Paper.project.layers.main.children.splice(this.data.index, 1);
				// logFog();

				// // subs
				// console.log(`Removed substitute`);
				// // substitute.remove();
				// Paper.project.layers.main.children.splice(
				// 	Paper.project.layers.main.children.findIndex((x) => x.data.id == this.id),
				// 	1
				// );
				// logFog();

				// console.log(`Moved substitute to index`);
				// // substitute.insertBelow(Paper.project.layers.main.children[this.data.index + 1]);
				// Paper.project.layers.main.children.splice(this.data.index, 0, substitute);

				// Paper.project.layers.main.children.splice(this.data.index, 0, substitute);

				// let path = createPath(this.data.segments, this.strokeColor, this.strokeWidth);
				// path.opacity = 0.5;
				// path.data.tag = 'visual';

				// logFog();
				// console.log(`Added path-${this.id} to hidden, ${Paper.project.layers.hidden.children.findIndex((x) => x.id == this.id) > -1 ? 'confirmed' : 'not confirmed'}`);

				// let pathIndex = Paper.project.layers.main.children.findIndex((x) => x.id == path.id);
				// if (pathIndex > -1) {
				// 	logFog();
				// 	console.log(`Found path-${path.id} in main, should be in hidden`);
				// 	Paper.project.layers.main.children.splice(pathIndex, 1);
				// 	console.log(`Splicing path-${path.id} at index ${pathIndex} in main`);
				// }
				logFog();
				// path.onMouseEnter = undefined;
			}
			// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
			// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
			// console.log(Paper.project.layers.main.children);
			// console.log(Paper.project.layers.hidden.children);
		};

		// image.onMouseEnter = onImageErase;
		// image.onMouseMove = onImageErase;

		return image;
	};

	// const createText = (x, y, fontSize, color, content = '') => {
	// 	let text = new Paper.PointText({
	// 		point: new Paper.Point(x, y),
	// 		fillColor: color,
	// 		fontFamily: 'Arial',
	// 		fontSize: fontSize,
	// 		content: content,
	// 	});

	// 	text.bounds.topLeft.set(new Paper.Point(x, y));

	// 	// text.bounds.topLeft.set(new Paper.Point(x, y));

	// 	// text.onMouseEnter = function (event) {
	// 	// 	// if (this.data.tag != 'removed') {
	// 	// 	// 	console.log('text Enter');
	// 	// 	// }
	// 	// 	// either removed or removable
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable'].includes(this.data.tag)) {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);
	// 	// 		this.opacity = 0.5;
	// 	// 		Paper.project.layers.hidden.addChild(this);

	// 	// 		// text.onMouseEnter = undefined;
	// 	// 	}
	// 	// 	// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
	// 	// 	// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
	// 	// 	// console.log(Paper.project.layers.main.children);
	// 	// 	// console.log(Paper.project.layers.hidden.children);
	// 	// };
	// 	// text.onMouseMove = function (event) {
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable'].includes(this.data.tag)) {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);
	// 	// 		this.opacity = 0.5;
	// 	// 		Paper.project.layers.hidden.addChild(this);

	// 	// 		// path.onMouseEnter = undefined;
	// 	// 	}
	// 	// 	// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
	// 	// 	// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
	// 	// 	// console.log(Paper.project.layers.main.children);
	// 	// 	// console.log(Paper.project.layers.hidden.children);
	// 	// };

	// 	// text.attach('mouseenter', function (event) {
	// 	// 	if (this.data.tag != 'removed') {
	// 	// 		console.log('text Enter');
	// 	// 	}
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && this.data.tag != 'removed') {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.opacity = 0.5;
	// 	// 	}
	// 	// });
	// 	// text.attach('mousemove', function (event) {
	// 	// 	if (this.data.tag != 'removed') {
	// 	// 		console.log('text Move');
	// 	// 	}
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && this.data.tag != 'removed') {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.opacity = 0.5;
	// 	// 	}
	// 	// });
	// 	// text.onMouseEnter = function (event) {
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && this.data.tag != 'removed') {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.opacity = 0.5;
	// 	// 	}
	// 	// };

	// 	// text.onMouseMove = function (event) {
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && this.data.tag != 'removed') {
	// 	// 		this.data.tag = 'removable';
	// 	// 		this.opacity = 0.5;
	// 	// 	}
	// 	// };

	// 	// const func = function (event) {
	// 	// 	// if (this.data.tag != 'removed') {
	// 	// 	// 	console.log('Path Enter');
	// 	// 	// }
	// 	// 	// either removed or removable
	// 	// 	if (getControlData().tool == 'eraser' && _state.current.drag && !['removed', 'removable', 'visual'].includes(this.data.tag)) {
	// 	// 		logFog();
	// 	// 		// When the mouse enters / is moving over, move a copy of the path to the hidden layer and hide the segments of the main path to prevent events overlapping

	// 	// 		this.data.tag = 'removable';
	// 	// 		this.data.index = Paper.project.layers.main.children.findIndex((x) => x.id == this.id);
	// 	// 		this.data.content = this.content.toString();
	// 	// 		this.content = '';
	// 	// 		// this.segments = [];
	// 	// 		// this.opacity = 0.5;

	// 	// 		console.log(`Set text-${this.id} to removable at index ${this.data.index}`);
	// 	// 		logFog();

	// 	// 		// this.segments = [];
	// 	// 		// if(Paper.project.layers.main.children.includes

	// 	// 		// let path = createText(this.data.segments, this.strokeColor, this.strokeWidth);
	// 	// 		let text = createText(this.data.origin.x + _state.current.origin.x, this.data.origin.y + _state.current.origin.y, this.fontSize, this.fillColor, this.data.content);
	// 	// 		text.opacity = 0.5;
	// 	// 		text.data.tag = 'visual';

	// 	// 		Paper.project.layers.hidden.children.push(text);
	// 	// 		// logFog();
	// 	// 		// console.log(`Added path-${this.id} to hidden, ${Paper.project.layers.hidden.children.findIndex((x) => x.id == this.id) > -1 ? 'confirmed' : 'not confirmed'}`);

	// 	// 		let textIndex = Paper.project.layers.main.children.findIndex((x) => x.id == text.id);
	// 	// 		if (textIndex > -1) {
	// 	// 			logFog();
	// 	// 			console.log(`Found text-${text.id} in main, should be in hidden`);
	// 	// 			Paper.project.layers.main.children.splice(textIndex, 1);
	// 	// 			console.log(`Splicing text-${text.id} at index ${textIndex} in main`);
	// 	// 		}
	// 	// 		logFog();
	// 	// 		// path.onMouseEnter = undefined;
	// 	// 	}
	// 	// 	// console.log(`Main: ${Paper.project.layers.main.children.toString()}`);
	// 	// 	// console.log(`hidden: ${Paper.project.layers.hidden.children.toString()}`);
	// 	// 	// console.log(Paper.project.layers.main.children);
	// 	// 	// console.log(Paper.project.layers.hidden.children);
	// 	// };

	// 	text.onMouseEnter = onItemErase;
	// 	text.onMouseMove = onItemErase;

	// 	return text;
	// };

	// 525 events a second
	// const createPath = (segments, color, size, index = undefined) => {

	const createPath = (segments, color, size) => {
		// let object = {
		// 	segments: segments,
		// 	strokeColor: color,
		// 	strokeWidth: size,
		// 	strokeCap: 'round',
		// 	strokeJoin: 'round',
		// 	data: { tag: '' },
		// };
		// if (index != undefined) object.index = index;
		// let path = new Paper.Path(object);
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
		if (isMouseOverControl(event.clientX, event.clientY) || !isEventLeftClick(event)) return;

		let control = getControlData();
		let __state = {
			..._state.current,
			drag: true,
		};

		switch (control.tool) {
			case 'pencil':
				__state.path = createPath(
					[
						new Paper.Point(
							event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
						),
					],
					control.color,
					control.sizes.pencil
				);
				break;
			case 'ruler':
				__state.path = createPath(
					[
						new Paper.Point(
							event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
						),
					],
					control.color,
					control.sizes.ruler
				);

				let path = new Paper.Path({
					segments: [
						new Paper.Point(
							event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
						),
						new Paper.Point(
							event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
						),
					],
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
				__state.pivot = { x: event.clientX, y: event.clientY };
				break;
			case 'picker':
				let pixel = context.current.getImageData(event.clientX, event.clientY, 1, 1);
				let rgb = [pixel.data[0], pixel.data[1], pixel.data[2]];
				changeControlColor(rgbToHex(rgb));
				// let rgb = context.current.getImageData(event.clientX, event.clientY, 1, 1).data;
				// let hex = rgbToHex(rgb);
				break;
			case 'trash':
				if (__state.trashing) break;

				let ripple = new Paper.Shape.Circle({
					center: new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
					),
					fillColor: 'white',
				});
				// *****
				ripple.data = {
					origin: ripple.position,
				};
				let spliceIndex = Paper.project.layers.main.children.length;
				// Paper.project.layers.visual.addChild(ripple);

				let distances = [
					Math.hypot(0 - event.clientX, 0 - event.clientY),
					Math.hypot(window.innerWidth - event.clientX, 0 - event.clientY),
					Math.hypot(window.innerWidth - event.clientX, window.innerHeight - event.clientY),
					Math.hypot(0 - event.clientX, window.innerHeight - event.clientY),
				];
				let size = Math.max.apply(Math, distances);

				size = Math.ceil(size);
				let factor = 0.2;
				for (let i = 0; i < size; i++) {
					setTimeout(() => {
						ripple.radius = i;
					}, i * factor);
				}

				__state.trashing = true;

				setTimeout(() => {
					// console.log('done');
					// console.log(Array.from(Paper.project.layers.main.children));

					// Paper.project.layers.main.children = [Paper.project.layers.main.children[0]].concat(
					// 	Paper.project.layers.main.children.splice(spliceIndex, Paper.project.layers.main.children.length - 1)
					// );

					Paper.project.layers.main.children = Paper.project.layers.main.children.splice(spliceIndex, Paper.project.layers.main.children.length - 1);

					// console.log(Paper.project.layers.main.children);
					setState({
						..._state.current,
						trashing: false,
					});
					// console.log('done');
				}, size * factor);

				// Paper.project.layers.main.removeChildren();

				// createTrashRipple(event.clientX, event.clientY);
				// clearVisualCanvas();
				// clearMainCanvas();

				// __state.event = {};
				// __state.events = [];
				// createTrashRipple(event.clientX, event.clientY);
				break;
		}

		setState(__state);
	};

	const onMouseMove = (event) => {
		let __state = {
			..._state.current,
			mouse: { x: event.clientX, y: event.clientY },
		};
		if (_state.current.drag) {
			let control = getControlData();

			switch (control.tool) {
				case 'pencil':
					__state.path.add(
						new Paper.Point(
							event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
						)
					);
					break;
				case 'hand':
					if (__state.trashing) break;

					console.log(Paper.project.view.viewSize);
					console.log(Paper.project.view.center);
					console.log(new Paper.Point(_state.current.fixedOrigin.x + (event.clientX - _state.current.pivot.x), _state.current.fixedOrigin.y + (event.clientY - _state.current.pivot.y)));
					Paper.project.view.center = new Paper.Point(
						Paper.project.view.viewSize.width / 2 + _state.current.fixedOrigin.x - (event.clientX - _state.current.pivot.x),
						Paper.project.view.viewSize.height / 2 + _state.current.fixedOrigin.y - (event.clientY - _state.current.pivot.y)
					);

					Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;

					__state.origin = {
						x: _state.current.fixedOrigin.x - (event.clientX - _state.current.pivot.x),
						y: _state.current.fixedOrigin.y - (event.clientY - _state.current.pivot.y),
					};

					// Paper.project.layers.main.children.map((child) => {
					// 	switch (child.className) {
					// 		case 'Path':
					// 			// if (!child.data.origin) child.data.origin = child.position;
					// 			// if (!child.data.origin) child.data.origin = child.position;

					// 			// console.log(child);
					// 			// child.position = new Paper.Point(child.data.origin.x + __state.origin.x, child.data.origin.y + __state.origin.y);
					// 			child.position = new Paper.Point(child.data.origin.x + __state.origin.x, child.data.origin.y + __state.origin.y);
					// 			// console.log(child);
					// 			break;
					// 		case 'PointText':
					// 			child.bounds.topLeft.set(new Paper.Point(child.data.origin.x + __state.origin.x, child.data.origin.y + __state.origin.y));
					// 			break;
					// 	}
					// });
					break;
				case 'ruler':
					let path = Paper.project.layers.visual.children.find((path) => path.data.tag == 'ruler');
					// path.segments[1] = new Paper.Segment({
					// 	point: new Paper.Point(event.clientX, event.clientY),
					// });

					path.segments[1].point = new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
					);

					// console.log(path.segmentsma);
					// let _path = new Paper.Path();
					// _path.remove();
					break;
			}
			// dragging

			// __state.path = __state.path;
		}
		setState(__state);
	};

	// current bug: after making 3 lines, erase two lines from the left, and undo, after that erase two lines from the right, and undo
	// and then erase 2 lines from the left, and undo the and the third line will be deleted
	const onMouseUp = (event) => {
		// if there was no mouse down, which means it is over the control
		if (!_state.current.drag) return;

		let __state = {
			..._state.current,
			drag: false,
		};

		let control = getControlData();

		console.log(`Before mouse up: ${formatChildren(Paper.project.layers.main.children)}`);

		// var segmentCount = _state.current.path.segments.length;
		switch (control.tool) {
			case 'pencil':
				__state.path.add(
					new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
					)
				);
				// check here if the all the segments have the same position, then draw a circle in one position
				// console.log(__state.path);
				__state.path.simplify(10);
				// __state.path.data.origin = __state.path.position;
				// __state.path.data.origin = new Paper.Point(__state.path.position.x + _state.current.origin.x, __state.path.position.y + _state.current.origin.y);
				// __state.path.data.origin = new Paper.Point(__state.path.position.x - _state.current.origin.x, __state.path.position.y - _state.current.origin.y);
				break;
			case 'ruler':
				__state.path.add(
					new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
					)
				);
				// __state.path.data.origin = new Paper.Point(__state.path.position.x + _state.current.origin.x, __state.path.position.y + _state.current.origin.y);
				// __state.path.data.origin = new Paper.Point(__state.path.position.x - _state.current.origin.x, __state.path.position.y - _state.current.origin.y);

				Paper.project.layers.visual.children.find((path) => path.data.tag == 'ruler').remove();

				// let visualLayer = Paper.project.layers.find((layer) => layer.name == 'visual');
				// visualLayer.addChild(path);

				// )

				break;
			// __state.path = createPath(event.clientX, event.clientY, control.color, control.sizes.pencil);

			case 'eraser':
				// let removable = Paper.project.layers.hidden.children.filter((path) => path.data.tag == 'removable');
				// let removable = Paper.project.layers.hidden.children.filter((path) => path.data.presence == 'removable');
				let removable = Paper.project.layers.main.children.filter((path) => path.data.presence == 'removable');
				if (removable.length < 1) break;

				// Paper.project.layers.hidden.children = [];
				// if(removable.)
				// let index = Paper.project.layers.main.children.findIndex((x) => x.data == 'removable');

				// console.log(index);

				// console.log(removable);
				// if()
				// current bug is when making this group, we need none of the children that are added to be inside of the layer currently
				// this is achieved initially but after that, the first child is still left inside of the layer and simultaneously inside of the group
				// let group = new Paper.Group(
				console.log('Before making group:');
				console.log(`Removables: ${formatChildren(removable)}`);
				logFog();

				removable.map((item) => {
					item.opacity = 0;
					item.data.presence = 'removed';
					// console.log(`Moving "${item.className.toLowerCase()}-${item.id}" from hidden back to main at index ${item.data.index}`);

					// item.remove();
					// console.log(item.index);
					// Paper.project.layers.hidden.children.splice(
					// Paper.project.layers.hidden.children.findIndex((x) => x.id == item.id),
					// 1
					// );
					// logFog();
					// Paper.project.layers.main.children.splice(item.data.index, 0, item);
					logFog();

					// Paper.project.layers.main.children.splice(item.index, 1);
					// Paper.project.layers.children = Paper.project.layers.children.filter((child) => child.id != item.id);
				});

				// console.log

				new Paper.Group({
					data: {
						tag: 'restorable',
						presence: 'fixed',
						children: removable.map((item) => item.id),
					},
					// children: removable.map((item) => {
					// 	let path = new Paper.Path();
					// 	path.data.id = item.id;
					// 	path.data.tag = `substitute to ${item.className.toLowerCase()}-${item.id}`;
					// 	return path;
					// item.data = {
					// 	index: Paper.project.layers.main.children.findIndex((x) => x.id == item.id),
					// 	tag: 'removed',
					// 	origin: item.data.origin,
					// };

					// switch (item.className) {
					// 	case 'Path':
					// 		// let _path = new Paper.item({
					// 		// 	segments: item.segments,
					// 		// 	opacity: item.opacity,
					// 		// 	data: item.data,
					// 		// 	strokeColor: item.strokeColor,
					// 		// 	strokeWidth: item.strokeWidth,
					// 		// 	strokeCap: 'round',
					// 		// 	strokeJoin: 'round',
					// 		// 	data: item.data,
					// 		// });

					// 		// _path.onMouseEnter = function (event) {
					// 		// 	if (getControlData().tool == 'eraser' && _state.current.drag && this.data.tag != 'removed') {
					// 		// 		this.data.tag = 'removable';
					// 		// 		this.opacity = 0.5;
					// 		// 	}
					// 		// };

					// 		let path = createPath(item.segments, item.strokeColor, item.strokeWidth);
					// 		path.opacity = item.opacity;
					// 		path.data = item.data;
					// 		return path;
					// 	case 'PointText':
					// 		console.log(item.data);
					// 		let text = createText(item.data.origin.x, item.data.origin.y, item.fontSize, item.color, item.content);
					// 		text.opacity = item.opacity;
					// 		text.data = item.data;
					// 		return text;
					// }

					// return new Paper.Path({
					// 	segments: path.segments,
					// 	opacity: path.opacity,
					// 	data: path.data,
					// 	strokeColor: path.strokeColor,
					// 	strokeWidth: path.strokeWidth,
					// });
					// }),
					// data: { tag: 'restorable' },
				});

				// attempt #1
				// let group = new Paper.Group();

				// group.children = removable.map((path) => {
				// 	path.opacity = 0;
				// 	path.data = {
				// 		index: Paper.project.layers.main.children.findIndex((x) => x.id == path.id),
				// 		tag: 'removed',
				// 		origin: path.data.origin,
				// 	};

				// 	return path;
				// 	// group.addChild(path);
				// });

				// attempt #2
				// let group = new Paper.Group();

				// removable.map((path) => {
				// 	path.opacity = 0;
				// 	path.data = {
				// 		index: Paper.project.layers.main.children.findIndex((x) => x.id == path.id),
				// 		tag: 'removed',
				// 		origin: path.data.origin,
				// 	};

				// 	group.addChild(path);
				// });

				// attempt #3
				// let group = new Paper.Group({
				// 	children: removable.map((path) => {
				// 		path.opacity = 0;
				// 		path.data = {
				// 			index: Paper.project.layers.main.children.findIndex((x) => x.id == path.id),
				// 			tag: 'removed',
				// 			origin: path.data.origin,
				// 		};

				// 		return path;
				// 	}),
				// });
				// Paper.project.layers.main.children = Paper.project.layers.main.children.filter((x) => x.data.tag != 'removed');

				console.log(`After making group, adding children, and filtering: `);
				logFog();
				// console.log(
				// 	Paper.project.layers.main.children
				// 		.map((x) => {
				// 			if (x.className == 'Group') return x.children.map((x) => x.data.id);
				// 		})
				// 		.filter((x) => x == undefined)
				// );
				// group.children = removable;

				// console.log(`After adding removables to group: ${JSON.stringify(Array.from(Paper.project.layers.main.children).map((x) => `${x.className}: ${x.id} ${x.data.tag}`))}`);
				// let children = group.children.map((x) => x.id);
				// ******
				// Paper.project.layers.main.children.map((child) => {
				// 	if (child.data.tag == 'removed') {
				// 		console.log(child.data);
				// 		// console.log(`Remove: ${child.id}`);

				// 		Paper.project.layers.main.children.splice(
				// 			Paper.project.layers.main.children.findIndex((x) => x.id == child.id),
				// 			1
				// 		);
				// 	}
				// });

				// removable.map((x) => x.remove());

				// new Paper.Group({
				// 	children: removable,
				// 	data: 'removable',
				// });

				// console.log(group.id);
				// Paper.project.layers.main.children[index] = new Paper.Group(removable);

				// console.log(Paper.project.layers.main.children);
				// removable.map((x) => x.remove());
				// removable.map((x) => {
				// x.opacity = 0;
				// x.data = 'removed';
				// x.remove();
				// });
				// Paper.project.layers.main.children.push();
				// console.log(Paper.project.layers.main.children);

				// console.log(removable);
				// when removing just change opacity to 0 and add as a group to children so when you undo and see that group you just unpack it and return oopaity back to normal
				// when removing to opacity 0, set data to 'removed' and when mouse enters ignore if own data is 'removed'
				// when resotring through undo and unpacking, change all data to ''
				// removable.map((x) => x.remove());
				break;
			case 'hand':
				if (_state.current.pivot == null) return;
				__state.fixedOrigin = _state.current.origin;
				__state.pivot = null;
				break;
			case 'text':
				if (Paper.project.layers.text.children.length > 0) submitText();

				// console.log(control.sizes.text / maxSize);
				let fontSize = 24 * Math.max(control.sizes.text / maxSize, 0.25);
				// let padding = 0;
				let lineHeight = fontSize / 5.14;
				let highlightPadding = fontSize / 4;

				// create rectangle, create text area at rectangle position
				let textGroup = new Paper.Group({
					children: [
						new Paper.Group({
							children: [],
						}),
						new Paper.PointText({
							point: new Paper.Point(
								event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
								event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
							),
							fillColor: control.color,
							fontFamily: 'Arial',
							fontSize: fontSize,
							data: {
								origin: {
									x: event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
									y: event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2,
								},
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
						// new Paper.PointText({
						// 	point: new Paper.Point(0, 18),
						// 	fillColor: 'black',
						// 	fontFamily: 'Arial',
						// 	fontSize: 18,
						// 	content: 'hey',
						// }), // highlighted text
						// new Paper.PointText({
						// 	point: new Paper.Point(0, 36),
						// 	fillColor: 'black',
						// 	fontFamily: 'Arial',
						// 	fontSize: 18,
						// }), // highlighted text
					],
					data: {
						lineHeight: lineHeight,
						highlightPadding: highlightPadding,
						origin: {
							x: event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
							y: event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2,
						},
					},
				});

				textGroup.children.highlights = textGroup.children[0];
				textGroup.children.content = textGroup.children[1];
				textGroup.children.blinker = textGroup.children[2];
				textGroup.children.highlightText = textGroup.children[3];
				// textGroup.children.highlightContent = textGroup.children[3];
				// textGroup.children.content.selected = true;

				Paper.project.layers.text.addChild(textGroup);

				// Paper.Shape.Rectangle({
				// 	point: new Paper.Point(event.clientX, event.clientY),
				// 	size: new Paper.Size(150, 25),
				// 	strokeColor: 'blue',
				// });

				// props.focusOnHidden.current();
				// textGroup.children.content.bounds.topLeft.set(new Paper.Point(event.clientX, event.clientY));

				// textGroup.children.content.bounds.topRight.set(new Paper.Point(event.clientX, event.clientY));
				// console.log(textGroup.children.content);
				// console.log(new Paper.Point(event.clientX, event.clientY));
				// textGroup.children.content.selected = true;
				textGroup.children.content.bounds.topLeft.set(
					new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2
					)
				);
				// console.log(textGroup.children.content.position);

				textGroup.children.blinker.opacity = 1;
				// textGroup.children.blinker.bounds.topCenter.set(new Paper.Point(event.clientX, event.clientY - (fontSize + padding)));
				// console.log(fontSize / 160);
				textGroup.children.blinker.size = new Paper.Size(fontSize / 160, fontSize + highlightPadding);
				// textGroup.children.blinker.size = new Paper.Size(fontSize / 160, fontSize);
				textGroup.children.blinker.bounds.topLeft.set(
					new Paper.Point(
						event.clientX + Paper.project.view.center.x - Paper.project.view.viewSize.width / 2,
						event.clientY + Paper.project.view.center.y - Paper.project.view.viewSize.height / 2 - highlightPadding
					)
				);
				// textGroup.children.blinker.bounds..set(new Paper.Point(event.clientX, event.clientY));
				// textGroup.children.highlight.bounds.bottomLeft.set(new Paper.Point(event.clientX, event.clientY + fontSize + lineHeight + highlightPadding));

				// textGroup.children.highlight.bounds.bottomLeft.set(new Paper.Point(event.clientX, event.clientY + highlightPadding + fontSize + lineHeight));
				// textGroup.children.highlight.bounds.bottomLeft.set(new Paper.Point(event.clientX, event.clientY + highlightPadding));

				// textGroup.children.highlightContent.bounds.bottomLeft.set(new Paper.Point(event.clientX, event.clientY + highlightPadding));

				// textGroup.children.highlight.bounds.topCenter.set(new Paper.Point(event.clientX, event.clientY - (fontSize + padding)));
				// textGroup.children.highlight.bounds.bottomLeft.set(new Paper.Point(event.clientX, event - highlightPadding));

				props.hiddenInput.current.set('');
				props.hiddenInput.current.input.focus();

				__state.blinkerInterval = setBlinker(true);
				// rectangle.data = {
				// 	tag: 'input',
				// 	focused: true,
				// 	onChange: () => {
				// 		console.log('hi');
				// 	},
				// 	refer: React.createRef(null),
				// };

				// __state.textareas.push({ x: event.clientX, y: event.clientY, rectangle: rectangle });
				break;
		}

		// console.log(Paper.project.layers.main.name);
		// console.log(Paper.project.layers.main.children.map((x) => `${x.className}: ${x.id}`));
		// console.log(`After mouse up: ${formatChildren(Paper.project.layers.main.children)}`);
		console.log(`After mouse up:`);
		logFog();

		setState(__state);
	};

	// const representContent = (content, linebreaks, debug = false) => {
	// 	let _content = content.split('');
	// 	linebreaks.map((linebreak_index, index) => {
	// 		_content.splice(linebreak_index + index, 0, debug ? '\\N' : '\n');
	// 	});
	// 	content = _content.join('');

	// 	return content;
	// 	// text.data.linebreaks.map((index) => {
	// 	// console.log(index);
	// 	// console.log(content);
	// 	// });
	// };

	const getLineFromSelectionIndex = (selectionIndex, content, linebreak = false, linebreakStart = false) => {
		if (selectionIndex == 0) return 0; // if the selection index is in the first character, it is in the first line
		// let _content = content.split('\n').map(element => element + '\n')
		// let _content = content.split('\n').map((element) => element + '\n');
		// .split('\n').map(element => element + '\n\n').join('')
		let linebreaks = content
			.split('')
			.map((element, index) => {
				// if (element == '\n') return index + (linebreak ? 1 : 0);
				if (element == '\n') return index;
			})
			.filter((element) => element != undefined)
			.reverse()
			.concat([-1]);

		console.log(selectionIndex);
		console.log(linebreaks);

		for (let i = 0; i < linebreaks.length; i++) {
			// if (selectionIndex + (linebreak ? 0 : 0) > linebreaks[i]) {
			if (selectionIndex > linebreaks[i]) {
				let line = linebreaks.map((_, index) => index).reverse()[i];
				if (selectionIndex - linebreaks[i] == 1 && linebreak && !linebreakStart) {
					console.log(
						`Caught line ${linebreakStart ? 'but it at start' : ''} ${linebreaks.map((_, index) => index).reverse()[i]} that should be at line ${
							linebreaks.map((_, index) => index).reverse()[i] - 1
						}`
					);
					return line - 1;
				}
				// console.log(linebreaks[i]);
				// console.log(linebreaks.map((_, index) => index).reverse()[i]);
				// return Math.max(linebreaks.map((_, index) => index).reverse()[i] - 1, 0);
				// return linebreaks.map((_, index) => index).reverse()[i];
				return line;
			}
		}
	};

	const onWrite = (event) => {
		if (Paper.project.layers.text.children.length < 1) return;
		if (event.keyCode == 13 && !event.shiftKey) return submitText();

		let text = Paper.project.layers.text.children[0];

		// let previousText = event.target.value;
		// let { selectionStart, selectionEnd } = props.hiddenInput.current.input;
		// let selection = event.target.value.slice(selectionStart, selectionEnd);
		setTimeout(() => {
			// change text content
			let content = event.target.value;

			// console.log(`Total Linebreaks: ${text.data.linebreaks.length}: ${text.data.linebreaks.join(', ')}`);
			// console.log(`Content Length: ${content.length}`);
			// console.log(`Current representation: ${representContent(content, text.data.linebreaks, true)}`);

			// console.log(`Last previous line: ${prev.slice(text.data.linebreaks[text.data.linebreaks.length - 1])}`);

			// console.log(content.length);
			// console.log(text.data.linebreaks[text.data.linebreaks.length - 1]);

			// remove all the linebreaks exceeding text length
			// text.data.linebreaks.map((index, _index) => {
			// 	// console.log(``)
			// 	// if (content.length < index - text.data.linebreaks + 1 && event.keyCode == 8) {
			// 	// console.log(index - text.data.linebreaks + 1);
			// 	if (content.length < index && event.keyCode == 8) {
			// 		// console.log(`Removing line break: ${index}`);
			// 		// console.log(_index);
			// 		// console.log(prev.slice(text.data.linebreaks[_index - 1] -));
			// 		// console.log(prev);
			// 		text.data.linebreaks.splice(_index, 1);
			// 		props.hiddenInput.current.set(prev);
			// 		content = prev;
			// 	}
			// });

			// text.data.linebreaks.map((index, _index) => {
			// 	// console.log(index);
			// 	let _content = content.split('');
			// 	_content.splice(index + _index, 0, '\n');
			// 	content = _content.join('');
			// 	// console.log(content);
			// });

			// ctrl + a
			// text align changes depending on the first character only, (excluding digits, symbols etc.)

			text.children.content.content = content;

			// console.log(`Last line: ${content.slice(text.data.linebreaks[text.data.linebreaks.length - 1])}`);

			// get selection data
			let { selectionStart, selectionEnd } = props.hiddenInput.current.input;
			let selection = event.target.value.slice(selectionStart, selectionEnd);

			let line = getLineFromSelectionIndex(selectionStart, content);

			// text.children[4].content = `Selection Start: ${selectionStart}`;
			// text.children[5].content = `Selection End: ${selectionEnd}`;
			// console.log(`Selection Start: ${selectionStart}`);
			// console.log(`Selection End: ${selectionEnd}`);

			// console.log(line);
			// console.log(content.split('\n'));
			let previousLines = content.split('\n').slice(0, line);

			let blinkerStart = new Paper.Point(
				text.children.content.bounds.leftCenter.x +
					calculateTextWidth(content.split('\n')[line].slice(0, selectionStart - (previousLines.length + previousLines.join('').length)), text.children.content.fontSize),
				text.data.origin.y - text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * line
			);

			console.log(Paper.project.layers.text.children);

			// add higlights
			if (selection.length > 0) {
				// t  same legnth as \n
				let lineStart = getLineFromSelectionIndex(selectionStart, content, true, true);
				let lineEnd = getLineFromSelectionIndex(selectionEnd, content, true);
				// let lineStart = 0;
				// let lineEnd = 0;
				console.log(`Highlighted ${lineEnd - lineStart + 1} lines`);
				if (text.children.highlights.children.length < lineEnd - lineStart + 1) {
					let addition = lineEnd - lineStart + 1 - text.children.highlights.children.length;
					// console.log(`Highlights dont match lines, adding ${addition} highlights to original ${text.children.highlights.children.length} highlights`);

					for (let i = 0; i < addition; i++) {
						// let group = new Paper.Group({
						// 	children: [
						// 		new Paper.Shape.Rectangle({
						// 			point: new Paper.Point(text.data.origin.x, text.data.origin.y),
						// 			size: new Paper.Size(0, text.children.content.fontSize + text.data.highlightPadding),
						// 			fillColor: '#3390FF',
						// 			opacity: 0,
						// 		}),
						// 		new Paper.PointText({
						// 			point: new Paper.Point(text.data.origin.x, text.data.origin.y),
						// 			fillColor: 'white',
						// 			fontFamily: 'Arial',
						// 			fontSize: text.children.content.fontSize,
						// 			opacity: 0,
						// 		}),
						// 	],
						// });
						// new Paper.Shape.Rectangle({
						// point: new Paper.Point(event.clientX, event.clientY),
						// 	size: new Paper.Size(0, fontSize + highlightPadding),
						// 	fillColor: '#3390FF',
						// }); // highlight box
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
				// console.log(`Lines: ${}`);
				for (let i = lineStart; i <= lineEnd; i++) {
					let line = content.split('\n')[i];
					if (i < content.split('\n').length - 1) line += '\n';

					let _previousLines = content.split('\n').slice(0, i);
					let offset = _previousLines.length + _previousLines.join('').length;
					console.log(`Offset: ${offset}`);
					let indices = line.split('').map((_, index) => index + offset);
					// console.log(`rect index: ${i - lineStart}`);
					let highlight = text.children.highlights.children[i - lineStart];
					let highlightText = text.children.highlightText.children[i - lineStart];
					let _content = '';
					let start = false;
					let end = false;
					if (indices.includes(selectionStart)) {
						start = true;
						console.log(`Selection start in line ${i}`);
					}
					if (indices.includes(selectionEnd)) {
						end = true;
						console.log(`Selection end in line ${i}`);
					}

					// *** make sure this is disabled for last line
					start = start ? selectionStart - offset : 0;
					end = end ? selectionEnd - offset : line.length;
					_content = line.slice(start, end);

					highlight.opacity = 1;
					highlightText.opacity = 1;

					let position = new Paper.Point(
						text.children.content.bounds.leftCenter.x + calculateTextWidth(line.slice(0, start), text.children.content.fontSize),
						text.data.origin.y - text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * i
					);

					highlight.size.width = calculateTextWidth(_content.replace('\n', 't'), text.children.content.fontSize);
					highlight.bounds.topLeft.set(position);

					highlightText.content = '\n'.repeat(i) + _content;
					highlightText.bounds.topLeft.set(new Paper.Point(position.x, text.data.origin.y));

					// let blinkerStart = new Paper.Point(
					// 	text.children.content.bounds.leftCenter.x +
					// 		calculateTextWidth(content.split('\n')[line].slice(0, selectionStart - (previousLines.length + previousLines.join('').length)), text.children.content.fontSize),
					// 	text.data.origin.y + text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * line
					// );

					// text.children.highlight.bounds.bottomLeft.x = blinkerX;
					// text.children.highlight.bounds.bottomLeft.set(blinkerStart);

					// console.log(_content.length);
					// console.log(_content.replace('\n', '\\n'));
					// if(se)
					// console.log(`Offset: ${offset}`);
					console.log(`Indices: ${indices}`);
					console.log(`Line ${i}: ${content.split('\n')[i]}`);

					// text.children.highlights.addChild();
				}

				// console.log(`Selecting lines: ${lineStart} -> ${lineEnd}`);
				// console.log(content.split('\n'));
				// new Paper.Shape.Rectangle({
				// 	point: new Paper.Point(event.clientX, event.clientY),
				// 	size: new Paper.Size(0, fontSize + highlightPadding),
				// 	fillColor: '#3390FF',
				// }); // highlight box
			} else {
				text.children.highlights.children.map((highlight) => (highlight.opacity = 0));
				text.children.highlightText.children.map((highlight) => (highlight.opacity = 0));
			}

			// move blinker & highlight to selection start
			// let blinkerX =
			// text.children.content.bounds.leftCenter.x +
			// calculateTextWidth(content.split('\n')[line].slice(0, selectionStart - (previousLines.length + previousLines.join('').length)), text.children.content.fontSize);

			// let blinkerX = text.children.content.bounds.leftCenter.x + calculateTextWidth(content.split('\n')[line], text.children.content.fontSize);
			// text.children.blinker.position = new Paper.Point(blinkerX, text.children.content.bounds.leftBottom.y + text.data.highlightPadding);
			// text.children.blinker.bounds.bottomLeft.set(new Paper.Point(blinkerX, text.data.origin.y + text.data.highlightPadding + (text.children.content.fontSize + text.data.lineHeight) * line));
			text.children.blinker.bounds.topLeft.set(blinkerStart);
			// text.children.highlight.bounds.leftCenter.set(new Paper.Point(blinkerX, text.children.highlight.position.y));

			// change highlight size & move to selection start
			// text.children.highlight.size.width = calculateTextWidth(selection, text.children.content.fontSize);
			// text.children.highlight.bounds.bottomLeft.x = blinkerX;
			// text.children.highlight.bounds.bottomLeft.set(blinkerStart);

			// change highlighted text content & move to selection start
			// text.children.highlightContent.bounds.bottomLeft.x = blinkerX;

			// text.children.highlightContent.bounds.bottomLeft.x = blinkerStart.x;
			// text.children.highlightContent.content = `${'\n'.repeat(line)}${selection}`;

			// hide blinker if any text is selected
			setState({
				..._state.current,
				blinkerInterval: setBlinker(selection.length < 1),
			});

			text.children.content.bounds.topLeft.set(new Paper.Point(text.data.origin.x, text.data.origin.y));
			// console.log(text.children.content.position);
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

	const onSubmit = (event) => {
		console.log('submit');
	};

	const onToolChange = (tool) => {
		if (tool) {
			setState({
				..._state.current,
				tool: tool,
			});
		}
		submitText();
	};

	props.onMouseDown.current = onMouseDown;
	props.onMouseUp.current = onMouseUp;
	props.onMouseMove.current = onMouseMove;

	props.onDownload.current = onDownload;
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

	useEffect(() => {
		context.current = canvas.current.getContext('2d');

		document.oncontextmenu = (event) => {
			event.preventDefault();
			event.stopPropagation();
		};

		canvas.current.width = window.innerWidth;
		canvas.current.height = window.innerHeight;

		// context.current.fillStyle = 'white';
		// context.current.fillRect(0, 0, window.innerWidth, window.innerHeight);
		// window.addEventListener('paste', (event) => {

		// });

		window.addEventListener('keydown', (keyboardEvent) => {
			// let control = getControlData();
			// console.log();
			// If  is not repeating, and is Ctrl + V and not writing in text
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

			// let control = getControlData();
			if (keyboardEvent.keyCode == 90 && keyboardEvent.ctrlKey && Paper.project.layers.text.children.length == 0) {
				// dragging and ruler
				// not dragging and ruler
				if (!_state.current.drag) {
					undo();
				} else {
					if (_state.current.tool == 'eraser') {
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
		});

		window.addEventListener('resize', () => {
			canvas.current.width = window.innerWidth;
			canvas.current.height = window.innerHeight;

			console.log(Paper.project.layers.essential.children[0]);
			Paper.project.layers.essential.children[0].children.background.size = new Paper.Size(window.innerWidth, window.innerHeight);
			Paper.project.layers.essential.children[0].children.background.position = Paper.project.view.center;

			// update the view to prevent glitching when resizing to a bigger size
			Paper.view.viewSize = new Paper.Size(window.innerWidth, window.innerHeight);
			// context.current.fillStyle = 'black';
			// context.current.fillRect(0, 0, window.innerWidth, window.innerHeight);

			// to update the paper project;
			// let path = new Paper.Path({
			// segments: [new Paper.Point(150, 150), new Paper.Point(300, 300)],
			// });
			// path.remove();
			// Paper.view.draw();
			// update();
		});

		Paper.setup(canvas.current);
		Paper.project.activeLayer.name = 'essential';
		Paper.project.addLayer(new Paper.Layer({ name: 'hidden' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'main' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'visual' }));
		Paper.project.addLayer(new Paper.Layer({ name: 'text' }));

		// let blinker = new Paper.Shape.Rectangle({
		// 	point: new Paper.Point(0, 0),
		// 	size: new Paper.Size(1, 25),
		// 	fillColor: 'black',
		// 	strokeColor: 'black',
		// 	opacity: 0,
		// });

		// Paper.project.layers.blinker.addChild(blinker);
		// Paper.project.layers.blinker.children.blinker = blinker;

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
		// group.children.blinker = group.children[1];

		group.children.background.bounds.topLeft.set(new Paper.Point(0, 0));

		Paper.project.layers.essential.addChild(group);
		Paper.view.onMouseMove = function (event) {
			if (_state.current.drag && _state.current.tool == 'eraser') {
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

				// console.log(hitResult);
				// let children = Paper.project.layers.main.children.filter((child) => child.data.tag != 'restorable');
				// children.map((child) => {
				// 	let path = new Paper.Path({
				// 		point: event.point,
				// 	});
				// 	console.log(path);
				// 	if (child.intersects(path)) {
				// 		console.log(`Erase ${child.className.toLowerCase()}-${child.id}`);
				// 	}
				// 	path.remove();
				// });
				// children.map((child) => {});
				// console.log(children);
			}
		};

		// context.current.fillStyle = 'black';
		// context.current.fillRect(0, 0, window.innerWidth, window.innerHeight);

		// for colr picker
		// update(_state.current.events);
		// clearMainCanvas();
	}, []);

	return (
		<div>
			<a
				style={{
					visiblity: 'hidden',
					pointerEvents: 'none',
				}}
				download='image.jpg'
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
				}}
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
