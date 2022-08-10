import React, { useState, useRef, useEffect, useCallback } from 'react';
import Circle from './Circle.js';
import IconButton from './IconButton.js';
import Grid from './Grid.js';
import InputField from './InputField.js';
import NameField from './NameField.js';
import Textarea from './Textarea.js';
import SVGFontIcon from './SVGFontIcon.js';
import {
	IconPencil,
	IconEraser,
	IconRuler,
	IconText,
	IconTrash,
	IconPicker,
	IconReset,
	IconDownload,
	IconHand,
	IconGrid,
	IconZoomIn,
	IconZoomOut,
	IconInfo,
	IconError,
	IconWarn,
	IconPin,
} from './icons/Icons.js';
import useControl from './hooks/ControlHook.js';
import useWhiteboard from './hooks/WhiteboardHook.js';
import { useControlContext } from './contexts/ControlContext.jsx';
import { useLogContext } from './contexts/LogContext.jsx';

// show user id and other user id's somehow when he's debugging

// change log system to: cancel active log to show the current log, incase trying to switch tools and each tool has an error, when switching mutliple tools the first tool's error will still stay since it's 2 seconds (*)
// if a create log has the same content (excluding level) as the active log, dont create it (-)
// limit log height by calculating distance between it and control (? or might get too long if its too far) (-)
// make control height and width a percentage when going on mobile since you can't resize it or zoom like chrome browser (-)

// performance optimization: create two different control components one vertical one horizontal
// hand and grid aren't centered correctly (*)
// zoom icon has spaces (*)
// create a toggle debug button, make it stick to local storage, find out in adobe xd
// add pinned icon to the left of the level icon in logs when permanent (*)

// find out a way to make it easier and more efficient to share functions between components and use them

const Control = (props) => {
	// const resizableTools = ['ruler', 'pencil', 'text'];
	const toolToIcon = {
		ruler: IconRuler,
		pencil: IconPencil,
		text: IconText,
		eraser: IconEraser,
		picker: IconPicker,
		trash: IconTrash,
	};

	const { control, setControl } = useControlContext();
	const { log } = useLogContext();
	const { createLog } = useControl();
	const { downloadCanvas } = useWhiteboard();

	const [state, setState] = useState({
		controlTop: true,
		controlHidden: false,
		nameFocus: false,
		grid: false,
		zoomIndex: undefined,
		movingIndicator: false,
		color: '#000000',
		tool: 'pencil',
		latestResizableTool: 'pencil',
		resizableTools: ['ruler', 'pencil', 'text'],
		maxSize: 10,
		sizes: Object.assign(
			{},
			...['ruler', 'pencil', 'text'].map((tool) => {
				return {
					[tool]: 100 / 10, // maxSize
				};
			})
		),
	});

	const indicator = useRef(null);
	const controlRef = useRef(null);
	const hiddenInput = useRef(null);

	const colors = [
		'#FFFFFF',
		'#A8A8A8',
		'#545454',
		'#000000',
		'#FE6A00',
		'#803400',
		'#0026FF',
		'#001280',
		'#804000',
		'#401F00',
		'#01FFFF',
		'#017F7E',
		'#FFD800',
		'#947C00',
		'#B100FE',
		'#590080',
		'#FE0000',
		'#800001',
		'#0094FE',
		'#00497E',
		'#00FF01',
		'#017F01',
		'#FF006E',
		'#7F0037',
	].map((color) => {
		return (
			<Circle
				size={25}
				color={color}
				className={'button'}
				onClick={() => {
					// props.onColorChange(color);
					setControl({
						...control,
						color: color,
					});
				}}
				key={`color-${color}`}
			/>
		);
	});

	const reset = () => {
		setControl({
			...control,
			...state,
			color: '#000000',
			tool: 'pencil',
			latestResizableTool: 'pencil',
			sizes: Object.assign(
				{},
				...control.resizableTools.map((tool) => {
					return {
						[tool]: 100 / control.maxSize,
					};
				})
			),
		});
	};

	const getControlData = () => state;

	const getTextColor = (backgroundColor, boolean = false) => {
		let rgb = (backgroundColor = backgroundColor.replace('#', ''))
			.match(new RegExp('(.{' + backgroundColor.length / 3 + '})', 'g'))
			.map(function (l) {
				return parseInt(backgroundColor.length % 2 ? l + l : l, 16);
			})
			.join(',')
			.split(',');

		let exp = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 186;

		return boolean ? exp : exp ? '#000000' : '#ffffff';
	};

	const getToolIndex = (tool) => {
		let mainIndex = control.resizableTools.findIndex((x) => x == control.tool);
		if (mainIndex < 0) return -1;

		let toolIndex = control.resizableTools.findIndex((x) => x == tool);
		if (toolIndex < 0) return -1;

		let tools = control.resizableTools.map((tool, index) => {
			return {
				index: Math.abs(mainIndex - index) > 1 ? -1 : index,
				tool: tool,
			};
		});

		let diff = tools[mainIndex].index - 1;
		tools[mainIndex].index = 1;
		if (mainIndex - 1 > -1) tools[mainIndex - 1].index -= diff;
		if (mainIndex + 1 < tools.length) tools[mainIndex + 1].index -= diff;

		tools = tools.filter((tool) => tool.index >= 0);

		let resultIndex = tools.findIndex((x) => x.tool == tool);
		if (resultIndex < 0) return -1;

		return tools[resultIndex].index;
	};

	const onToolChange = (tool) => {
		props.onToolChange.current(tool);

		setControl({
			...control,
			tool: tool,
			latestAction: `update-tool-${tool}`,
			latestResizableTool: control.resizableTools.includes(tool) ? tool : control.latestResizableTool,
		});
		// console.log(state.sizes);
	};

	const getWindowDimensions = () => {
		const { innerWidth: width, innerHeight: height } = window;
		return {
			width,
			height,
		};
	};

	const angle = (cx, cy, ex, ey) => {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx); // range (-PI, PI]
		theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
		theta -= 180;
		if (theta < 0) theta = 360 + theta; // range [0, 360)

		return theta;
	};

	const onMouseDown = (event) => {
		props.whiteboardRefs.onMouseDown.current(event);

		// console.log(`a: down ${isTouch}`);

		// console.log(props.hiddenInput.current.input);
		// props.hiddenInput.current.input.focus();

		let svgBounds = indicator.current.getBoundingClientRect();
		let handle = indicator.current.querySelector('#indicator-handle');
		let handleRadius = parseFloat(handle.getAttribute('r')) + 5; // extra padding;
		let x = parseFloat(handle.getAttribute('cx')) + svgBounds.x - handleRadius / 2;
		let y = parseFloat(handle.getAttribute('cy')) + svgBounds.y - handleRadius / 2;

		if (control.resizableTools.includes(control.tool)) {
			if (event.clientX >= x && event.clientX <= x + handleRadius) {
				if (event.clientY >= y && event.clientY <= y + handleRadius) {
					setState({
						...state,
						movingIndicator: true,
					});
				}
			}
		}
	};

	const onMouseMove = (event) => {
		// console.log('move');
		props.whiteboardRefs.onMouseMove.current(event);

		let svgBounds = indicator.current.getBoundingClientRect();
		let x = svgBounds.x + svgBounds.width / 2;
		let y = svgBounds.y + svgBounds.height / 2;

		if (state.movingIndicator) {
			let indicatorValue = angle(event.clientX, event.clientY, x, y) / 3.6;
			if (Math.abs(indicatorValue - control.sizes[control.tool]) < 50) {
				setControl({
					...control,
					sizes: {
						...control.sizes,
						[control.tool]: indicatorValue,
					},
				});
			} else {
				indicatorValue = [100, 0.1].reduce((a, b) => {
					return Math.abs(b - control.sizes[control.tool]) < Math.abs(a - control.sizes[control.tool]) ? b : a;
				});
				setControl({
					...control,
					sizes: {
						...control.sizes,
						[control.tool]: indicatorValue,
					},
				});
			}
		}
	};

	const onMouseUp = (event) => {
		props.whiteboardRefs.onMouseUp.current(event);

		// console.log(document.activeElement.tagName);
		// let control = getControlData();

		if (document.activeElement.tagName != 'INPUT' && control.tool == 'text') {
			// console.log(document.activeElement);
			// console.log(props.onToolChange.current);
			props.hiddenInput.current.input.focus();
		} else {
			if (control.latestAction != 'mouse-up') {
				setControl({
					...control,
					latestAction: 'mouse-up',
				});
			}
			props.onToolChange.current('');
		}

		setState({
			...state,
			movingIndicator: false,
		});
	};

	const toggleControl = () => {
		controlRef.current.style.transition = '0.1s cubic-bezier(0, -0.02, 0, 1)';
		setTimeout(() => {
			controlRef.current.style.transition = 'none';
		}, 100);

		setState({ ...state, controlHidden: !state.controlHidden });
	};

	const switchIndex = (index) => {
		setState({
			...state,
			zoomIndex: index,
		});
	};

	props.switchIndex.current = switchIndex;

	useEffect(() => {
		let dimensions = getWindowDimensions();
		let controlTop = dimensions.width >= 702 + 50;

		// test how logs intercept each other with very detailed time (0.1s)
		// test hwo logs are created after a certain time after a log has finished
		// check if its smooth transition

		// setTimeout(function () {
		// 	createLog('hey', 'error');
		// 	setTimeout(function () {
		// 		createLog('woah', 'error');
		// 		setTimeout(function () {
		// 			createLog('come back', 'error');
		// 			setTimeout(function () {
		// 				createLog('dont back', 'error', true);
		// 			}, 1000);
		// 		}, 100);
		// 	}, 4000);
		// }, 0);

		setState({
			...state,
			controlTop: controlTop,
		});
	}, []);

	useEffect(() => {
		const handleResize = () => {
			let dimensions = getWindowDimensions();
			let controlTop = dimensions.width >= 702 + 50;
			setState({
				...state,
				controlTop: controlTop,
			});
		};

		window.addEventListener('resize', handleResize);
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('touchstart', onMouseDown);
		window.addEventListener('touchmove', onMouseMove);
		window.addEventListener('touchend', onMouseUp);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('touchstart', onMouseDown);
			window.removeEventListener('touchmove', onMouseMove);
			window.removeEventListener('touchend', onMouseUp);
		};
	}, [state, control]);

	return (
		<div
			ref={controlRef}
			style={{
				width: '100%',
				height: '100%',
				position: 'fixed',
				top: 0,
				left: 0,
				marginTop: state.controlTop ? (state.controlHidden ? -168 : 0) : 0,
				marginLeft: !state.controlTop ? (state.controlHidden ? -168 : 0) : 0,
				// display: state.controlVisible ? 'flex' : 'none',
				display: 'flex',
				flexDirection: state.controlTop ? 'column' : 'row',
				transition: 'none',
				alignItems: 'center',
			}}
		>
			<Textarea
				style={{
					width: 0,
					height: 0,
				}}
				inputStyle={{
					fontSize: 0,
					color: 'transparent',
					resize: 'none',
				}}
				className='hidden-textarea'
				// style={{
				// width: 250,
				// height: 500,
				// }}
				_ref={props.hiddenInput}
				onKeyUp={props.onWrite.current}
				onSubmit={props.onSubmit.current}
				submit
			/>

			<div
				style={{
					backgroundColor: 'rgba(0.26666666666, 0.26666666666, 0.26666666666, 0.55)',
					width: state.controlTop ? 702 : 168,
					height: state.controlTop ? 168 : 702,
					borderRadius: `0px ${state.controlTop ? '0px 36px 36px' : '36px 36px 0px'}`,
					display: 'flex',
					flexDirection: state.controlTop ? 'column' : 'row',
				}}
				className='control-inner'
			>
				<div
					style={{
						width: state.controlTop ? '100%' : 132,
						height: state.controlTop ? 132 : '100%',
						display: 'flex',
						flexDirection: state.controlTop ? 'row' : 'column-reverse',
					}}
				>
					<div
						style={{
							width: state.controlTop ? 146 : 132,
							height: state.controlTop ? 132 : 146,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							// opacity: resizableTools.includes(state.tool) ? 1 : 0.5,
						}}
					>
						<svg width='120' height='120' ref={indicator} id='indicator'>
							<defs>
								<mask id='borderMask'>
									<circle cx='60' cy='60' r='50' fill='white' />
								</mask>
							</defs>
							<circle
								cx='60'
								cy='60'
								r='50'
								stroke={control.resizableTools.includes(control.tool) ? getTextColor(control.color) : 'transparent'}
								fill={control.color}
								strokeWidth='15'
								strokeDasharray={Math.PI * 100}
								// strokeDashoffset={((100 - control.indicatorValue) / 100) * (Math.PI * 100)}
								strokeDashoffset={((100 - control.sizes[control.latestResizableTool]) / 100) * (Math.PI * 100)}
								mask='url(#borderMask)'
								style={{
									transition: 'stroke 0.2s',
								}}
							/>

							<circle
								cx={46.5 * Math.cos((control.sizes[control.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
								cy={46.5 * Math.sin((control.sizes[control.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
								r={control.resizableTools.includes(control.tool) ? 7 : 0}
								// fill={control.resizableTools.includes(control.tool) ? getTextColor(control.color) : control.color}
								fill={getTextColor(control.color)}
								id='indicator-handle'
								style={{
									transition: '0.2s',
									transitionProperty: 'r, fill',
								}}
							></circle>

							{control.resizableTools.map((tool) => {
								let Component = toolToIcon[tool];
								return (
									<Component
										size={getToolIndex(tool) > -1 ? (control.tool != tool ? 18 : 24) : 0}
										fill={getTextColor(control.color, true) ? 'black' : 'white'}
										parentSize={120}
										xOffset={[-20, 0, 20][getToolIndex(tool)]}
										yOffset={-12}
										// transform={['translate(-20, -12)', 'translate(0, -12)', 'translate(20, -12)'][getToolIndex(tool)]}
										opacity={control.tool == tool ? 1 : 0.5}
										style={{ opacity: control.tool == tool ? 1 : 0.5, transition: '0.2s' }}
										key={`resizable-tool-${tool}`}
									/>
								);
							})}

							<foreignObject
								width='100%'
								height='100%'
								// style={{
								// backgroundColor: 'blue',
								// display: 'flex',
								// justifyContent: 'center',
								// alignItems: 'center',
								// }}
							>
								<div
									xmlns='http://www.w3.org/1999/xhtml'
									style={{
										fontFamily: 'JannaLT',
										fontSize: '16px',
										transition: 'fill 0.2s',
										color: control.resizableTools.includes(control.tool) ? getTextColor(control.color) : 'transparent',
										// backgroundColor: 'red',
										position: 'absolute',
										width: 32,
										height: 32,
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										left: 120 / 2 - 32 / 2,
										top: 120 / 2 - 32 / 2 + 12,
									}}
								>
									{Math.max(((control.maxSize / 100) * control.sizes[control.latestResizableTool]).toFixed(1), 0.1).toFixed(1)}
								</div>
							</foreignObject>
						</svg>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: state.controlTop ? 'flex-start' : 'center',
							alignItems: state.controlTop ? 'center' : 'flex-end',
							width: state.controlTop ? 269 : 132,
							height: state.controlTop ? 132 : 269,
						}}
					>
						<Grid id='colors' height={8} spacing={5} direction={state.controlTop ? 'column' : 'row'} groupDirection={state.controlTop ? 'row' : 'column-reverse'}>
							{colors}
						</Grid>
					</div>

					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: state.controlTop ? 'row' : 'column-reverse',
							width: state.controlTop ? 271 : 132,
							height: state.controlTop ? 132 : 271,
						}}
					>
						<Grid
							style={{
								marginRight: state.controlTop ? 15 : 0,
								marginTop: state.controlTop ? 0 : 15,
							}}
							height={2}
							direction={state.controlTop ? 'row' : 'column-reverse'}
							groupDirection={state.controlTop ? 'column' : 'row'}
							spacing={4}
							id='interactive-tools'
						>
							{['pencil', 'ruler', 'eraser', 'picker', 'text', 'trash'].map((tool, index) => {
								// if (index == 0) console.error(`Updating tools in control, current tool: "${control.tool}"`);
								let Component = toolToIcon[tool];
								return (
									<Circle size={40.5} className={'button'} color={control.tool == tool ? '#959595' : 'black'} onClick={() => onToolChange(tool)} key={`key-tool-${tool}`}>
										<Component parentSize={40.5} fill='#c5c5c5' size='32' />
									</Circle>
								);
							})}
						</Grid>
						<Grid id='utility-tools' height={2} spacing={4} groupDirection={state.controlTop ? 'column' : 'row'} direction={state.controlTop ? 'row' : 'column-reverse'}>
							<Circle
								size={40.5}
								className={'button'}
								onClick={() => {
									if (control.latestAction != 'download') {
										setControl({
											...control,
											latestAction: 'download',
										});
									}
									props.onToolChange.current('');
									downloadCanvas();
								}}
							>
								<IconDownload fill='#c5c5c5' size={32} parentSize={40.5} />
							</Circle>
							<Circle
								size={40.5}
								className={'button'}
								onClick={() => {
									props.onReset.current();
									reset();
								}}
							>
								<IconReset fill='#c5c5c5' size={32} parentSize={40.5} />
							</Circle>
							<Circle
								size={40.5}
								className={'button'}
								onClick={() => {
									createLog('Tool not yet implemented', 'error');
									// setState({ ...state, grid: !state.grid });
								}}
							>
								{/* <IconGrid fill='#c5c5c5' parentSize={40.5} size={32} opacity={state.grid ? 1 : 0.5} /> */}
								<IconGrid fill='#c5c5c5' parentSize={40.5} size={32} />
							</Circle>
							<IconButton
								size={40.5}
								className={'button'}
								color={control.tool.includes('zoom') ? '#959595' : 'black'}
								switch
								switchable={control.tool.includes('zoom')}
								switchIndex={state.zoomIndex}
								onClick={(tool) => onToolChange(tool)}
							>
								<IconZoomIn fill='#c5c5c5' size={32} parentSize={40.5} name='zoomin' />
								<IconZoomOut fill='#c5c5c5' size={32} parentSize={40.5} name='zoomout' />
							</IconButton>
							<Circle size={40.5} className={'button'} color={control.tool == 'hand' ? '#959595' : 'black'} onClick={() => onToolChange('hand')}>
								<IconHand fill='#c5c5c5' size={32} parentSize={40.5} />
							</Circle>
						</Grid>
					</div>

					{!state.controlTop ? (
						// <InputField
						// 	inputWidth={127}
						// 	id='name'
						// 	onChange={(event, refuse) => {
						// 		if (event.target.value.length > 32) {
						// 			// event.target.value = event.target.value.slice(0, 32);
						// 			createLog(`Name length limit exceeded (${event.target.value.length}/32)`, 'error');
						// 			// console.log(event);
						// 			refuse(event.target.value.slice(0, 32));
						// 		} else {
						// 			props.onNameChange(event);
						// 		}
						// 	}}
						// 	onFocus={() => setState({ ...state, nameFocus: true })}
						// 	underline
						// 	underlineStyle={{
						// 		backgroundColor: 'black',
						// 		height: 2,
						// 		width: 127,
						// 		marginBottom: 11,
						// 	}}
						// />
						<NameField
							inputWidth={127}
							onChange={(value, approve) => {
								if (value.length > 32) {
									createLog(`Name length limit exceeded (${value.length}/32)`, 'error');
								} else {
									approve();
								}
							}}
							onFocus={() => setState({ ...state, nameFocus: true })}
							underline
							underlineStyle={{
								backgroundColor: 'black',
								height: 2,
								width: 127,
								marginBottom: 11,
							}}
						/>
					) : undefined}
				</div>

				<div
					style={{
						width: state.controlTop ? '100%' : 36,
						height: state.controlTop ? 36 : '100%',
						display: 'flex',
						justifyContent: 'flex-start',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					{state.controlTop ? (
						<NameField
							inputWidth={329}
							onChange={(value, approve) => {
								if (value.length > 32) {
									createLog(`Name length limit exceeded (${value.length}/32)`, 'error');
								} else {
									approve();
								}
							}}
							onFocus={() => setState({ ...state, nameFocus: true })}
							underline
							underlineStyle={{
								height: 2,
								width: 329,
								marginBottom: 11,
							}}
						/>
					) : // <InputField
					// 	inputWidth={329}
					// 	id='name'
					// 	onChange={(event, refuse) => {
					// 		if (event.target.value.length > 32) {
					// 			// event.target.value = event.target.value.slice(0, 32);
					// 			createLog(`Name length limit exceeded (${event.target.value.length}/32)`, 'error');
					// 			// console.log(event);
					// 			refuse(event.target.value.slice(0, 32));
					// 		} else {
					// 			props.onNameChange(event);
					// 		}
					// 	}}
					// 	onFocus={() => setState({ ...state, nameFocus: true })}
					// 	underline
					// 	underlineStyle={{
					// 		height: 2,
					// 		width: 329,
					// 		marginBottom: 11,
					// 	}}
					// />
					undefined}
				</div>
			</div>
			<div
				style={{
					backgroundColor: 'rgba(0.26666666666, 0.26666666666, 0.26666666666, 0.55)',
					width: state.controlTop ? 32 : 18,
					height: state.controlTop ? 18 : 32,
					borderRadius: `0px ${state.controlTop ? '0px 8px 8px' : '8px 8px 0px'}`,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
				onClick={toggleControl.bind(this)}
				className='control-arrow'
			>
				<img
					style={{
						transform: state.controlTop ? (state.controlHidden ? 'rotate(180deg)' : 'rotate(0deg)') : state.controlHidden ? 'rotate(90deg)' : 'rotate(-90deg)',
					}}
					src='./upwards-arrow.svg'
					width='12'
					height='12'
				></img>
			</div>

			<div
				style={{
					width: '100%',
					position: 'fixed',
					bottom: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					marginBottom: !log.log.active ? -28 : 0,
					transition: '0.2s cubic-bezier(0, -0.02, 0, 1)',
				}}
			>
				<div
					style={{
						// backgroundColor: state.log.permanent ? 'rgba(0.26666666666, 0.26666666666, 0.26666666666, 0.55)' : '#737373',
						backgroundColor: '#737373',
						width: 'max-content',
						// paddingLeft: 15,
						// paddingRight: 15,
						height: 28,

						borderRadius: '10.5px 10.5px 0px 0px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',

						marginTop: !log.log.active ? -28 : 0,
					}}
				>
					{(() => {
						let iconsObject = {
							info: IconInfo,
							error: IconError,
							warn: IconWarn,
						};
						let Icon = iconsObject[log.log.level];
						return (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Icon size={28} fill={log.log.levelColor} />
								<div
									style={{
										marginRight: 7,
										fontSize: 14,
										maxWidth: window.innerWidth - 150,
									}}
									className='log-content'
								>
									{log.log.content}
								</div>
								{log.log.permanent ? <IconPin width={20} height={28} childX={-28} childY={0} fill='black' /> : ''}
							</div>
						);
					})()}
				</div>
			</div>
		</div>
	);
};

export default Control;
