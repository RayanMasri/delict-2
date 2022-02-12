// import React, { useRef, useEffect, useState } from 'react';
// import Circle from './Circle.js';
// // import { throttle } from lodash;
// const Whiteboard = (props) => {
// 	const [state, _setState] = useState({
// 		cursor: {
// 			size: 10,
// 			position: {
// 				x: 0,
// 				y: 0,
// 			},
// 		},
// 		drawing: false,
// 		events: [],
// 		visualPosition: {
// 			x: 0,
// 			y: 0,
// 		},
// 		// events: [
// 		// 	{
// 		// 		event: 'stroke',
// 		// 		options: {
// 		// 			color: '#000000',
// 		// 			size: 1,
// 		// 			erase: false,
// 		// 		},
// 		// 		data: [
// 		// 			{
// 		// 				x: 890,
// 		// 				y: 360,
// 		// 			},
// 		// 			{
// 		// 				x: 890,
// 		// 				y: 361,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 361,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 362,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 363,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 365,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 366,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 367,
// 		// 			},
// 		// 			{
// 		// 				x: 888,
// 		// 				y: 368,
// 		// 			},
// 		// 			{
// 		// 				x: 887,
// 		// 				y: 370,
// 		// 			},
// 		// 			{
// 		// 				x: 887,
// 		// 				y: 371,
// 		// 			},
// 		// 			{
// 		// 				x: 887,
// 		// 				y: 373,
// 		// 			},
// 		// 			{
// 		// 				x: 887,
// 		// 				y: 375,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 376,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 378,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 380,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 381,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 382,
// 		// 			},
// 		// 			{
// 		// 				x: 886,
// 		// 				y: 383,
// 		// 			},
// 		// 			{
// 		// 				x: 885,
// 		// 				y: 386,
// 		// 			},
// 		// 			{
// 		// 				x: 885,
// 		// 				y: 387,
// 		// 			},
// 		// 			{
// 		// 				x: 885,
// 		// 				y: 390,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 391,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 393,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 395,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 396,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 398,
// 		// 			},
// 		// 			{
// 		// 				x: 883,
// 		// 				y: 400,
// 		// 			},
// 		// 			{
// 		// 				x: 882,
// 		// 				y: 401,
// 		// 			},
// 		// 			{
// 		// 				x: 882,
// 		// 				y: 402,
// 		// 			},
// 		// 			{
// 		// 				x: 882,
// 		// 				y: 405,
// 		// 			},
// 		// 			{
// 		// 				x: 882,
// 		// 				y: 406,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 407,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 408,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 410,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 411,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 412,
// 		// 			},
// 		// 			{
// 		// 				x: 881,
// 		// 				y: 412,
// 		// 			},
// 		// 		],
// 		// 	},
// 		// ],
// 		event: {},
// 		pivot: {},
// 		origin: {
// 			x: 0,
// 			y: 0,
// 		},
// 		fixedOrigin: {
// 			x: 0,
// 			y: 0,
// 		},
// 	});
// 	const _state = useRef(state);
// 	const setState = (data) => {
// 		_state.current = data;
// 		_setState(data);
// 	};

// 	let maxSize = 10;
// 	let eraserMultiplier = 3.5;

// 	const canvas = useRef(null);
// 	const context = useRef(null);

// 	const visual_canvas = useRef(null);
// 	const visual_context = useRef(null);

// 	const cursor = useRef(null);

// 	const download = useRef(null);

// 	const uuid = () => Date.now().toString() + Math.floor(Math.random(1, 9) * 1000000).toString();
// 	const isMouseOverControl = (x, y) => props.isMouseOverControl.current(x, y);
// 	const getControlData = () => props.getControlData.current();
// 	const changeControlColor = (color) => props.changeControlColor.current(color);
// 	const isEventRightClick = (event) => {
// 		if ('which' in event) return event.which == 3;
// 		if ('button' in event) return event.button == 2;
// 	};
// 	const clearVisualCanvas = () => {
// 		visual_context.current.clearRect(0, 0, visual_canvas.current.width, visual_canvas.current.height);
// 	};
// 	const clearMainCanvas = () => {
// 		// context.current.fillStyle = '#000000';
// 		// context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
// 		context.current.fillStyle = '#FFFFFF';
// 		context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
// 	};
// 	const onDownload = () => {
// 		download.current.href = canvas.current.toDataURL();
// 		download.current.click();
// 	};
// 	// const createTrashRipple = (x, y) => {
// 	// 	// let ctx = global.canvas.visual.context;
// 	// 	// let canvas = global.canvas.visual.canvas;
// 	// 	// let width = Math.max(visual_canvas.current.width - x, x);
// 	// 	// let height = Math.max(visual_canvas.current.height - y, y);
// 	// 	// console.log(width)
// 	// 	// let size = Math.max(width, height);

// 	// 	let distances = [Math.hypot(0 - x, 0 - y), Math.hypot(window.innerWidth - x, 0 - y), Math.hypot(window.innerWidth - x, window.innerHeight - y), Math.hypot(0 - x, window.innerHeight - y)];
// 	// 	let size = Math.max.apply(Math, distances);

// 	// 	// let index = distances.findIndex((x) => x == size);
// 	// 	// let comp = [
// 	// 	// 	[0, 0],
// 	// 	// 	[window.innerWidth, 0],
// 	// 	// 	[window.innerWidth, window.innerHeight],
// 	// 	// 	[0, window.innerHeight],
// 	// 	// ];

// 	// 	size = Math.ceil(size);

// 	// 	for (let i = 0; i < size; i += Math.ceil(window.innerWidth / 1080)) {
// 	// 		setTimeout(() => {
// 	// 			context.current.fillStyle = '#FFFFFF';
// 	// 			context.current.beginPath();
// 	// 			context.current.arc(x, y, i, 0, 2 * Math.PI);
// 	// 			context.current.fill();

// 	// 			// visual_context.current.strokeStyle = '#FF0000';
// 	// 			// visual_context.current.moveTo(x, y);
// 	// 			// visual_context.current.lineTo(comp[index][0], comp[index][1]);
// 	// 			// visual_context.current.stroke();

// 	// 			// visual_context.current.fillStyle = '#00FF00';
// 	// 			// visual_context.current.font = `${(window.innerWidth / 1080) * 24}px Arial`;
// 	// 			// visual_context.current.fillText(`Circle time: ${time / size} seconds`, x, y - (window.innerWidth / 1080) * 35);
// 	// 			// // visual_context.current.fillText(`Circles: ${size}`, x, y - (window.innerWidth / 1080) * 35);
// 	// 			// visual_context.current.fillText(`Circles: ${size}`, x, y);

// 	// 			// visual_context.current
// 	// 			// }, (2202.90717 / size) * i);
// 	// 			// let speed = (size / time)
// 	// 		}, (1 / size) * i);
// 	// 	}

// 	// 	setState({
// 	// 		..._state.current,
// 	// 		events: [],
// 	// 		event: {},
// 	// 	});

// 	// 	// console.log(size);

// 	// 	// setTimeout(() => {
// 	// 	// clearVisualCanvas();
// 	// 	// clearMainCanvas();
// 	// 	// for (let [_, value] of Object.entries(global.canvas)) {
// 	// 	// value.context.clearRect(0, 0, value.canvas.width, value.canvas.height);
// 	// 	// }
// 	// 	// console.log('Finished ripple');
// 	// 	// this.trashing = false;
// 	// 	// setState({
// 	// 	// 	..._state.current,
// 	// 	// 	trashing: false,
// 	// 	// });
// 	// 	// }, size);
// 	// };
// 	const rgbToHex = (rgb) => {
// 		let [r, g, b] = rgb;
// 		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
// 	};
// 	const update = (events, ctx = null) => {
// 		ctx = ctx || context.current;
// 		events.map((event) => {
// 			switch (event.event) {
// 				case 'stroke':
// 					ctx.beginPath();
// 					for (let i = 0; i < event.data.length - 1; i++) {
// 						ctx.globalCompositeOperation = event.options.erase ? 'destination-out' : 'source-over';

// 						ctx.strokeStyle = event.options.color;
// 						ctx.lineWidth = event.options.size;

// 						ctx.moveTo(event.data[i].x + _state.current.origin.x, event.data[i].y + _state.current.origin.y);
// 						ctx.lineTo(event.data[i + 1].x + _state.current.origin.x, event.data[i + 1].y + _state.current.origin.y);
// 						// ctx.moveTo(event.data[i].x , event.data[i].y);
// 						// ctx.lineTo(event.data[i + 1].x , event.data[i + 1].y);
// 						ctx.stroke();

// 						// console.log(event.data[i]);
// 					}
// 					ctx.closePath();

// 					break;
// 			}
// 		});

// 		// ctx.fillStyle = '#FF0000';
// 		// ctx.fillRect(-50 + _state.current.origin.x, -50 + _state.current.origin.y, 100, 100);
// 		// console.log(events);
// 		// ctx.fillRect(960 + -50 + _state.current.origin.x, 540 + -50 + _state.current.origin.y, 100, 100);
// 		// ctx.fillRect(1260 + -50 + _state.current.origin.x, 960 + -50 + _state.current.origin.y, 100, 100);
// 		// console.log(_state.current.events);
// 	};

// 	const undo = () => {
// 		if (_state.current.drawing) return;
// 		// context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
// 		context.current.fillStyle = '#FFFFFF';
// 		context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
// 		let sliced = _state.current.events.slice(0, _state.current.events.length - 1);

// 		update(sliced);
// 		setState({
// 			..._state.current,
// 			events: sliced,
// 		});
// 	};

// 	const onMouseDown = (event) => {
// 		if (isMouseOverControl(event.clientX, event.clientY) || isEventRightClick(event) || _state.current.trashing) return;

// 		let control = getControlData();
// 		let __state = {
// 			..._state.current,
// 			drawing: true,
// 			cursor: {
// 				size: control.sizes.eraser * eraserMultiplier,
// 				position: {
// 					x: event.clientX - (control.sizes.eraser * eraserMultiplier) / 2,
// 					y: event.clientY - (control.sizes.eraser * eraserMultiplier) / 2,
// 				},
// 			},
// 		};

// 		context.current.lineCap = 'round';
// 		context.current.lineJoin = 'round';

// 		switch (control.tool) {
// 			case 'pencil':
// 				context.current.globalCompositeOperation = 'source-over';

// 				context.current.strokeStyle = control.color;
// 				context.current.lineWidth = control.sizes.pencil / maxSize;

// 				context.current.beginPath();
// 				context.current.moveTo(event.clientX, event.clientY);

// 				__state.event = {
// 					event: 'stroke',
// 					options: {
// 						color: control.color,
// 						size: control.sizes.pencil / maxSize,
// 						erase: false,
// 					},
// 					// data: [{ x: event.clientX + _state.current.origin.x, y: event.clientY + _state.current.origin.y }],
// 					data: [{ x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y }],
// 				};
// 				break;
// 			case 'eraser':
// 				cursor.current.style.top = `${event.clientY - (control.sizes.eraser * eraserMultiplier) / 2}px`;
// 				cursor.current.style.left = `${event.clientX - (control.sizes.eraser * eraserMultiplier) / 2}px`;
// 				cursor.current.style.display = 'block';

// 				context.current.globalCompositeOperation = 'destination-out';

// 				context.current.strokeStyle = '#FFFFFF';
// 				context.current.lineWidth = control.sizes.eraser * eraserMultiplier;

// 				context.current.beginPath();
// 				context.current.moveTo(event.clientX, event.clientY);

// 				__state.event = {
// 					event: 'stroke',
// 					options: {
// 						color: '#FFFFFF',
// 						size: control.sizes.eraser * eraserMultiplier,
// 						erase: true,
// 					},
// 					data: [{ x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y }],
// 				};
// 				break;
// 			case 'ruler':
// 				context.current.globalCompositeOperation = 'source-over';

// 				context.current.strokeStyle = control.color;
// 				context.current.lineWidth = control.sizes.ruler / maxSize;

// 				context.current.beginPath();
// 				context.current.moveTo(event.clientX, event.clientY);

// 				visual_context.current.strokeStyle = 'rgba(0,0, 0, 0.2)';
// 				visual_context.current.lineWidth = 3;
// 				visual_context.current.setLineDash([10, 4]);

// 				// visual_context.current.beginPath();
// 				// visual_context.current.moveTo(event.clientX, event.clientY);

// 				__state.event = {
// 					event: 'stroke',
// 					options: {
// 						color: control.color,
// 						size: control.sizes.ruler / maxSize,
// 						erase: false,
// 					},
// 					data: [{ x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y }],
// 				};
// 				break;
// 			case 'hand':
// 				// __state.pivot = { x: event.clientX + _state.current.origin.x, y: event.clientY + _state.current.origin.y };
// 				// __state.pivot = { x: event.clientX + _state.current.origin.x, y: event.clientY + _state.current.origin.y };
// 				__state.pivot = { x: event.clientX, y: event.clientY };
// 				__state.visualPosition = { x: 0, y: 0 };
// 				visual_context.current.setLineDash([0, 0]);
// 				visual_canvas.current.style.opacity = 0.2;
// 				// visual_context.current.globalAlpha = 0.5;

// 				//grab the context from your destination canvas
// 				// var destCtx = context.current.getContext('2d');

// 				clearVisualCanvas();
// 				update(_state.current.events, visual_context.current);
// 				// visual_context.current.drawImage(canvas.current, 0, 0);
// 				//call its drawImage() function passing it the source canvas directly
// 				// destCtx.drawImage(sourceCanvas, 0, 0);
// 				break;
// 			case 'trash':
// 				clearVisualCanvas();
// 				clearMainCanvas();

// 				__state.event = {};
// 				__state.events = [];
// 				// createTrashRipple(event.clientX, event.clientY);
// 				break;
// 		}

// 		setState(__state);
// 	};
// 	// Returns a function, that, when invoked, will only be triggered at most once
// 	// during a given window of time. Normally, the throttled function will run
// 	// as much as it can, without ever going more than once per `wait` duration;
// 	// but if you'd like to disable the execution on the leading edge, pass
// 	// `{leading: false}`. To disable execution on the trailing edge, ditto.
// 	const throttle = (func, wait, options) => {
// 		var context, args, result;
// 		var timeout = null;
// 		var previous = 0;
// 		if (!options) options = {};
// 		var later = function () {
// 			previous = options.leading === false ? 0 : Date.now();
// 			timeout = null;
// 			result = func.apply(context, args);
// 			if (!timeout) context = args = null;
// 		};
// 		return function () {
// 			var now = Date.now();
// 			if (!previous && options.leading === false) previous = now;
// 			var remaining = wait - (now - previous);
// 			context = this;
// 			args = arguments;
// 			if (remaining <= 0 || remaining > wait) {
// 				if (timeout) {
// 					clearTimeout(timeout);
// 					timeout = null;
// 				}
// 				previous = now;
// 				result = func.apply(context, args);
// 				if (!timeout) context = args = null;
// 			} else if (!timeout && options.trailing !== false) {
// 				timeout = setTimeout(later, remaining);
// 			}
// 			return result;
// 		};
// 	};

// 	// function throttle(fn, delay) {
// 	// 	var timeout = null;

// 	// 	return function throttledFn() {
// 	// 		window.clearTimeout(timeout);
// 	// 		var ctx = this;
// 	// 		var args = Array.prototype.slice.call(arguments);

// 	// 		timeout = window.setTimeout(function callThrottledFn() {
// 	// 			fn.apply(ctx, args);
// 	// 		}, delay);
// 	// 	};
// 	// }

// 	// const throttle = (func, limit) => {
// 	// 	let lastFunc;
// 	// 	let lastRan;
// 	// 	return function () {
// 	// 		const context = this;
// 	// 		const args = arguments;
// 	// 		if (!lastRan) {
// 	// 			func.apply(context, args);
// 	// 			lastRan = Date.now();
// 	// 		} else {
// 	// 			clearTimeout(lastFunc);
// 	// 			lastFunc = setTimeout(function () {
// 	// 				if (Date.now() - lastRan >= limit) {
// 	// 					func.apply(context, args);
// 	// 					lastRan = Date.now();
// 	// 				}
// 	// 			}, limit - (Date.now() - lastRan));
// 	// 		}
// 	// 	};
// 	// };

// 	// const throttle = (func, limit) => {
// 	// 	let inThrottle;
// 	// 	return function () {
// 	// 		const args = arguments;
// 	// 		const context = this;
// 	// 		if (!inThrottle) {
// 	// 			func.apply(context, args);
// 	// 			inThrottle = true;
// 	// 			setTimeout(() => (inThrottle = false), limit);
// 	// 		}
// 	// 	};
// 	// };
// 	// const throttle = (callback, limit) => {
// 	// 	// var wait = false; // Initially, we're not waiting
// 	// 	return function () {
// 	// 		console.log(throttle.wait);
// 	// 		// We return a throttled function
// 	// 		if (!throttle.wait) {
// 	// 			throttle.wait = true;
// 	// 			// If we're not waiting
// 	// 			// callback.call(); // Execute users function
// 	// 			// wait = true; // Prevent future invocations
// 	// 			// setTimeout(function () {
// 	// 			// After a period of time
// 	// 			// wait = false; // And allow future invocations
// 	// 			// }, limit);
// 	// 		}
// 	// 	};
// 	// };
// 	// const penis = throttle(() => {
// 	// 	console.log('hi');
// 	// }, 1000);

// 	const appendMoveEvent = useRef(
// 		throttle((array, object) => {
// 			array.push(object);
// 			// return object;
// 		}, 25)
// 	);

// 	// const clearAndUpdate = useRef(
// 	// 	throttle(() => {
// 	// 		clearMainCanvas();
// 	// 		update(_state.current.events);
// 	// 	}, 1)
// 	// );
// 	// const throttled = useRef(throttle((newValue) => console.log(newValue), 1000));

// 	const onMouseMove = (event) => {
// 		if (_state.current.drawing && !_state.current.trashing) {
// 			let control = getControlData();
// 			if (['picker', 'trash'].includes(control.tool)) return;
// 			if (control.tool == 'ruler') {
// 				clearVisualCanvas();

// 				visual_context.current.beginPath();
// 				visual_context.current.moveTo(_state.current.event.data[0].x + _state.current.origin.x, _state.current.event.data[0].y + _state.current.origin.y);
// 				visual_context.current.lineTo(event.clientX, event.clientY);
// 				visual_context.current.stroke();

// 				return;
// 			}
// 			if (control.tool == 'hand') {
// 				// console.log(_state.current);
// 				// console.log('Mouse move');
// 				setState({
// 					..._state.current,
// 					// fixed origin + delta
// 					visualPosition: {
// 						x: event.clientX - _state.current.pivot.x,
// 						y: event.clientY - _state.current.pivot.y,
// 					},
// 					origin: {
// 						x: _state.current.fixedOrigin.x + (event.clientX - _state.current.pivot.x),
// 						y: _state.current.fixedOrigin.y + (event.clientY - _state.current.pivot.y),
// 						// x: event.clientX - _state.current.pivot.x),
// 						// y: _state.current.fixedOrigin.y + (event.clientY - _state.current.pivot.y),
// 					},
// 				});

// 				visual_context.current.setLineDash([0, 0]);

// 				// visual_context.current.clearRect(0, 0, visual_canvas.current.width, visual_canvas.current.height);
// 				// visual_context.current.drawImage(canvas.current, 0, 0);

// 				// clearAndUpdate.current();
// 				// penis();
// 				// throttle(() => {
// 				// console.log('hi');
// 				// clearMainCanvas();
// 				// update(_state.current.events);
// 				// }, 10)();
// 				// console.log(_state.current);
// 				// console.log({
// 				// 	x: event.clientX - _state.current.pivot.x,
// 				// 	y: event.clientY - _state.current.pivot.y,
// 				// });
// 				// console.log('---');
// 				// console.log({
// 				// 	x: _state.current.fixedOrigin.x + event.clientX - _state.current.pivot.x,
// 				// 	y: _state.current.fixedOrigin.y + event.clientY - _state.current.pivot.y,
// 				// });
// 				// console.log(event.clientY - _state.current.pivot.y);
// 				return;
// 			}

// 			let __state = {
// 				..._state.current,
// 			};

// 			if (control.tool == 'eraser') {
// 				__state.cursor = {
// 					size: control.sizes.eraser * eraserMultiplier, // eraser cursor multiplier
// 					position: {
// 						x: event.clientX - (control.sizes.eraser * 3.5) / 2,
// 						y: event.clientY - (control.sizes.eraser * 3.5) / 2,
// 					},
// 				};
// 			}
// 			// } else {
// 			// }
// 			// appendMoveEvent.current(__state.event.data, { x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y });
// 			__state.event.data.push({ x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y });

// 			context.current.globalCompositeOperation = control.tool == 'eraser' ? 'destination-out' : 'source-over';

// 			context.current.strokeStyle = control.tool == 'pencil' ? control.color : '#FFFFFF';
// 			context.current.lineWidth = control.tool == 'eraser' ? state.cursor.size : control.sizes[control.tool] / maxSize;
// 			context.current.lineCap = 'round';
// 			context.current.lineJoin = 'round';

// 			context.current.lineTo(event.clientX, event.clientY);
// 			context.current.stroke();

// 			setState(__state);
// 		}
// 	};

// 	const onMouseUp = (event) => {
// 		if (_state.current.trashing) return;

// 		let control = getControlData();
// 		cursor.current.style.display = 'none';
// 		clearVisualCanvas();

// 		let __state = {
// 			..._state.current,
// 			drawing: false,
// 			// .
// 			// events: _state.current.events.concat([_state.current.event]),
// 			// event: {},
// 		};
// 		switch (control.tool) {
// 			case 'ruler':
// 				if (_state.current.drawing) {
// 					context.current.lineTo(event.clientX, event.clientY);
// 					context.current.stroke();
// 				}
// 				break;
// 			case 'picker':
// 				let pixel = context.current.getImageData(event.clientX, event.clientY, 1, 1);
// 				let rgb = [pixel.data[0], pixel.data[1], pixel.data[2]];

// 				changeControlColor(rgbToHex(rgb));
// 				break;
// 			case 'hand':
// 				if (_state.current.pivot == null) return;

// 				visual_canvas.current.style.opacity = 1;

// 				// visual_context.current.globalAlpha = 1;
// 				// console.log('mouse up');
// 				// console.log('Previous Origin');
// 				// console.log(_state.current);
// 				// console.log('Previous fixed origin');
// 				// console.log(_state.current.fixedOrigin);
// 				__state.fixedOrigin = _state.current.origin;
// 				// __state.origin = _state.current.origin;
// 				// __state.fixedOrigin = {
// 				// x: _state.current.fixedOrigin.x + _state.current.origin.x,
// 				// y: _state.current.fixedOrigin.y + _state.current.origin.y,
// 				// x: _state.current.fixedOrigin.x + _state.current.origin.x,
// 				// x: event.clientX - _state.current.pivot.x,
// 				// y: event.clientY - _state.current.pivot.y,
// 				// };
// 				// console.log('New fixed origin');
// 				// console.log(__state.fixedOrigin);
// 				__state.pivot = null;
// 				// console.log(__state);
// 				// console.log(`Set fixed origin after mouse up: x: ${__state.fixedOrigin.x} y: ${__state.fixedOrigin.y}`);
// 				// console.log('---');
// 				// 	..._state.current,
// 				// 	origin: {
// 				// 		x: _state.current.fixedOrigin.x + event.clientX - _state.current.pivot.x,
// 				// 		y: _state.current.fixedOrigin.y + event.clientY - _state.current.pivot.y,
// 				// 	},
// 				// 	fixedOrigin: {
// 				// 		x: _
// 				// 	}
// 				// });
// 				clearMainCanvas();
// 				update(_state.current.events);
// 				// console.log({
// 				// x: _state.current.fixedOrigin.x + event.clientX - _state.current.pivot.x,
// 				// y: _state.current.fixedOrigin.y + event.clientY - _state.current.pivot.y,
// 				// });
// 				break;
// 		}

// 		if (_state.current.drawing) {
// 			// if (['ruler', 'eraser', 'pencil'].includes(control.tool)) __state.event.data.push({ x: event.clientX + _state.current.fixedOrigin.x, y: event.clientY + _state.current.fixedOrigin.y });
// 			// if (['ruler', 'eraser', 'pencil'].includes(control.tool)) __state.event.data.push({ x: _state.current.fixedOrigin.x - event.clientX , y: _state.current.fixedOrigin.y - event.clientY   });
// 			// if (['ruler', 'eraser', 'pencil'].includes(control.tool)) __state.event.data.push({ x: _state.current.origin.x - event.clientX, y: _state.current.origin.y - event.clientY });
// 			if (['ruler', 'eraser', 'pencil'].includes(control.tool)) __state.event.data.push({ x: event.clientX - _state.current.origin.x, y: event.clientY - _state.current.origin.y });
// 			__state.events = __state.events.concat([__state.event]);
// 		}
// 		__state.event = {};

// 		context.current.closePath();
// 		visual_context.current.closePath();
// 		// if (control.tool == 'picker') {
// 		// }

// 		if (control.tool == 'ruler' && state.drawing) {
// 			context.current.lineTo(event.clientX, event.clientY);
// 			context.current.stroke();
// 		}

// 		// console.log(_state.current.events.concat([_state.current.event]));
// 		setState(__state);
// 		// setState({
// 		// 	..._state.current,
// 		// 	drawing: false,
// 		// 	events: _state.current.events.concat([_state.current.event]),
// 		// 	event: {},
// 		// });
// 	};

// 	props.onMouseDown.current = onMouseDown;
// 	props.onMouseUp.current = onMouseUp;
// 	props.onMouseMove.current = onMouseMove;

// 	props.onDownload.current = onDownload;

// 	useEffect(() => {
// 		document.oncontextmenu = (event) => {
// 			event.preventDefault();
// 			event.stopPropagation();
// 		};

// 		canvas.current.width = window.innerWidth;
// 		canvas.current.height = window.innerHeight;

// 		visual_canvas.current.width = window.innerWidth;
// 		visual_canvas.current.height = window.innerHeight;

// 		window.addEventListener('keydown', (keyboardEvent) => {
// 			if (keyboardEvent.keyCode == 90 && keyboardEvent.ctrlKey) {
// 				undo();
// 				// actions.clearVisual();
// 				// let filtered = global.events.filter((x) => x.cookie == undefined);

// 				// if (filtered.length == 0) return;

// 				// let event = filtered[filtered.length - 1];

// 				// socket.emit('undo', event.id, document.cookie);
// 				// actions.undo(event.id, undefined);
// 			}
// 		});

// 		window.addEventListener('resize', () => {
// 			canvas.current.width = window.innerWidth;
// 			canvas.current.height = window.innerHeight;

// 			visual_canvas.current.width = window.innerWidth;
// 			visual_canvas.current.height = window.innerHeight;
// 			update(_state.current.events);
// 		});

// 		context.current = canvas.current.getContext('2d');
// 		visual_context.current = visual_canvas.current.getContext('2d');
// 		// for colr picker
// 		update(_state.current.events);
// 		clearMainCanvas();
// 	}, []);

// 	return (
// 		<div>
// 			<a
// 				style={{
// 					visiblity: 'hidden',
// 					pointerEvents: 'none',
// 				}}
// 				download='image.jpg'
// 				ref={download}
// 			/>
// 			{/* <div
// 				style={{
// 					position: 'fixed',
// 					top: 0,
// 					left: 0,
// 				}}
// 			>
// 				adfkjalkdfjkladfj
// 			</div> */}

// 			<canvas
// 				style={{
// 					height: '100%',
// 					width: '100%',
// 					position: 'absolute',
// 					left: 0,
// 					top: 0,
// 					pointerEvents: 'none',
// 				}}
// 				ref={canvas}
// 			/>
// 			<canvas
// 				style={{
// 					height: '100%',
// 					width: '100%',
// 					position: 'fixed',
// 					left: state.visualPosition.x,
// 					top: state.visualPosition.y,
// 					pointerEvents: 'none',
// 					// backgroundColor: 'transparent',
// 				}}
// 				ref={visual_canvas}
// 			/>

// 			<svg
// 				ref={cursor}
// 				style={{
// 					position: 'fixed',
// 					display: 'none',
// 					top: state.cursor.position.y,
// 					left: state.cursor.position.x,
// 				}}
// 				width={state.cursor.size}
// 				height={state.cursor.size}
// 			>
// 				<circle cx={state.cursor.size / 2} cy={state.cursor.size / 2} r={state.cursor.size / 2} fill={'rgba(255, 0, 0, 0.5)'}></circle>
// 			</svg>
// 			{/* <Circle ref={cursor} size={state.cursorSize} /> */}
// 		</div>
// 	);
// };

// export default Whiteboard;
