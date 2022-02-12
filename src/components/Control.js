import React, { useState, useRef, useEffect } from 'react';
import Circle from './Circle.js';
import Grid from './Grid.js';
import InputField from './InputField.js';
import Textarea from './Textarea.js';
import SVGFontIcon from './SVGFontIcon.js';

//create two different control components one vertical one horizontal

const Control = (props) => {
	const maxSize = 10;
	const resizableTools = ['ruler', 'pencil', 'text'];
	// const fixedTools = ['eraser'];
	const fontIcons = {
		text: '\ue900',
		eraser: '\ue904',
		trash: '\ue901',
		ruler: '\ue902',
		download: '\ue903',
		hand: '\ue905',
		pencil: '\ue906',
		picker: '\ue907',
		reset: '\ue908',
	};

	const [state, _setState] = useState({
		controlTop: true,
		controlHidden: false,
		nameFocus: false,
		color: '#000000',
		// tool: 'pencil',
		// latestResizableTool: 'pencil',
		tool: 'pencil',
		latestResizableTool: 'pencil',
		movingIndicator: false,
		sizes: Object.assign(
			{},
			...resizableTools.map((tool) => {
				return {
					[tool]: 100 / maxSize,
				};
			})
		),
		// sizes: {
		// 	pencil: 100 / maxSize,
		// 	eraser: 100 / maxSize,
		// 	text: 450 / maxSize,
		// },
	});

	// for dom event listeners
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const indicator = useRef(null);
	const control = useRef(null);
	const hiddenInput = useRef(null);
	// props.control = control;

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
					props.onColorChange(color);
					setState({
						...state,
						color: color,
					});
				}}
			/>
		);
	});

	const changeColor = (color) => {
		console.log(color);
		setState({
			..._state.current,
			color: color,
		});
	};

	const positionOverRect = (x, y, rect) => {
		if (x >= rect.x && x <= rect.x + rect.width) {
			if (y >= rect.y && y <= rect.y + rect.height) {
				return true;
			}
		}

		return false;
	};

	const isMouseOverControl = (x, y) => {
		let inner = control.current.querySelector('.control-inner').getBoundingClientRect();
		let arrow = control.current.querySelector('.control-arrow').getBoundingClientRect();

		return positionOverRect(x, y, inner) || positionOverRect(x, y, arrow);
	};

	const getControlData = () => state;

	const reset = () => {
		setState({
			...state,
			color: '#000000',
			tool: 'pencil',
			latestResizableTool: 'pencil',
			// movingIndicator: false,
			sizes: Object.assign(
				{},
				...resizableTools.map((tool) => {
					return {
						[tool]: 100 / maxSize,
					};
				})
			),
		});
	};

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
		let mainIndex = resizableTools.findIndex((x) => x == state.tool);
		if (mainIndex < 0) return -1;

		let toolIndex = resizableTools.findIndex((x) => x == tool);
		if (toolIndex < 0) return -1;

		let tools = resizableTools.map((tool, index) => {
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

		setState({
			...state,
			tool: tool,
			latestResizableTool: resizableTools.includes(tool) ? tool : state.latestResizableTool,
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

		// console.log(props.hiddenInput.current.input);
		// props.hiddenInput.current.input.focus();

		let svgBounds = indicator.current.getBoundingClientRect();
		let handle = indicator.current.querySelector('#indicator-handle');
		let handleRadius = parseFloat(handle.getAttribute('r')) + 5; // extra padding;
		let x = parseFloat(handle.getAttribute('cx')) + svgBounds.x - handleRadius / 2;
		let y = parseFloat(handle.getAttribute('cy')) + svgBounds.y - handleRadius / 2;

		if (resizableTools.includes(_state.current.tool)) {
			if (event.clientX >= x && event.clientX <= x + handleRadius) {
				if (event.clientY >= y && event.clientY <= y + handleRadius) {
					setState({
						..._state.current,
						movingIndicator: true,
					});
				}
			}
		}
	};

	const onMouseMove = (event) => {
		props.whiteboardRefs.onMouseMove.current(event);

		let svgBounds = indicator.current.getBoundingClientRect();
		let x = svgBounds.x + svgBounds.width / 2;
		let y = svgBounds.y + svgBounds.height / 2;

		if (_state.current.movingIndicator) {
			let indicatorValue = angle(event.clientX, event.clientY, x, y) / 3.6;
			if (Math.abs(indicatorValue - _state.current.sizes[_state.current.tool]) < 50) {
				setState({
					..._state.current,
					sizes: {
						..._state.current.sizes,
						[_state.current.tool]: indicatorValue,
					},
				});
			} else {
				indicatorValue = [100, 0.1].reduce((a, b) => {
					return Math.abs(b - _state.current.sizes[_state.current.tool]) < Math.abs(a - _state.current.sizes[_state.current.tool]) ? b : a;
				});
				setState({
					..._state.current,
					sizes: {
						..._state.current.sizes,
						[_state.current.tool]: indicatorValue,
					},
				});
			}
		}
	};

	const onMouseUp = (event) => {
		// let control = getControlData();
		props.whiteboardRefs.onMouseUp.current(event);

		if (document.activeElement.tagName != 'INPUT' && _state.current.tool == 'text') {
			// console.log(document.activeElement);
			// console.log(props.onToolChange.current);
			props.hiddenInput.current.input.focus();
		} else {
			props.onToolChange.current('');
		}

		setState({
			..._state.current,
			movingIndicator: false,
		});
	};

	const toggleControl = () => {
		control.current.style.transition = '0.1s cubic-bezier(0, -0.02, 0, 1)';
		setTimeout(() => {
			control.current.style.transition = 'none';
		}, 100);

		setState({ ...state, controlHidden: !state.controlHidden });
	};

	// props.control.current = {
	// 	isMouseOverControl: isMouseOverControl,
	// 	getControlData: getControlData,
	// 	changeControlColor: changeColor,
	// };
	props.isMouseOverControl.current = isMouseOverControl;
	props.getControlData.current = getControlData;
	props.changeControlColor.current = changeColor;

	useEffect(() => {
		console.log('Use Effect');
		let dimensions = getWindowDimensions();
		let controlTop = dimensions.width >= 702 + 50;

		setState({
			...state,
			controlTop: controlTop,
		});

		window.addEventListener('resize', () => {
			let dimensions = getWindowDimensions();
			let controlTop = dimensions.width >= 702 + 50;
			setState({
				..._state.current,
				controlTop: controlTop,
			});
		});
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('mousemove', onMouseMove);

		// window.onmousedown = onMouseDown;
		// window.onmousemove = onMouseMove;
		// window.onmouseup = onMouseUp;
	}, []);

	return (
		<div
			ref={control}
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
								// stroke={getTextColor(state.color)}
								stroke={resizableTools.includes(state.tool) ? getTextColor(state.color) : 'transparent'}
								fill={state.color}
								strokeWidth='15'
								strokeDasharray={Math.PI * 100}
								// strokeDashoffset={((100 - state.indicatorValue) / 100) * (Math.PI * 100)}
								strokeDashoffset={((100 - state.sizes[state.latestResizableTool]) / 100) * (Math.PI * 100)}
								mask='url(#borderMask)'
								style={{
									transition: 'stroke 0.2s',
								}}
							/>
							{/* {(() => {
								let angle = state.sizes[state.tool] * 3.6;
								let origin = {
									x: 60,
									y: 60,
								};
								let mainR = 7;
								let r = 50 - mainR / 2;
								let x = r * Math.cos((angle * Math.PI) / 180) + origin.x;
								let y = r * Math.sin((angle * Math.PI) / 180) + origin.y;

								return <circle cx={x} cy={y} r={mainR} fill='white' id='indicator-handle'></circle>;
							})()} */}
							<circle
								cx={46.5 * Math.cos((state.sizes[state.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
								cy={46.5 * Math.sin((state.sizes[state.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
								r={resizableTools.includes(state.tool) ? 7 : 0}
								// fill={resizableTools.includes(state.tool) ? getTextColor(state.color) : state.color}
								fill={getTextColor(state.color)}
								id='indicator-handle'
								style={{
									transition: '0.2s',
									transitionProperty: 'r, fill',
								}}
							></circle>
							{resizableTools.map((tool) => {
								return (
									<SVGFontIcon
										size={getToolIndex(tool) > -1 ? (state.tool != tool ? 18 : 24) : 0}
										color={getTextColor(state.color, true) ? 'black' : 'white'}
										transform={['translate(-20, -12)', 'translate(0, -12)', 'translate(20, -12)'][getToolIndex(tool)]}
										style={{ opacity: state.tool == tool ? 1 : 0.5, transition: '0.2s' }}
										unicode={fontIcons[tool]}
									/>
									// <image
									// 	href={`./${getTextColor(state.color, true) ? 'black' : 'white'}-icons/${tool}.svg`}
									// 	width={getToolIndex(tool) > -1 ? (state.tool != tool ? 18 : 24) : 0}
									// 	width={getToolIndex(tool) > -1 ? (state.tool != tool ? 18 : 24) : 0}
									// 	x={'50%'}
									// 	y={'50%'}
									// 	// transform={['translate(12, -28)', 'translate(-12, -28)', 'translate(-28, -28)'][getToolIndex(tool)]}
									// 	transform={['translate(-28, -28)', 'translate(-12, -28)', 'translate(12, -28)'][getToolIndex(tool)]}
									// 	style={{ opacity: state.tool == tool ? 1 : 0.5, transition: '0.2s' }}
									// 	fill='red'
									// ></image>
								);
							})}

							<text
								x='50%'
								y='50%'
								dominantBaseline='middle'
								textAnchor='middle'
								fill={resizableTools.includes(state.tool) ? getTextColor(state.color) : 'transparent'}
								style={{
									fontFamily: 'JannaLT',
									fontSize: '16px',
									transition: 'fill 0.2s',
								}}
								transform={`translate(0, 8)`}
							>
								{/* {Math.max(((maxSize / 100) * state.indicatorValue).toFixed(1), 0.1).toFixed(1)} */}
								{Math.max(((maxSize / 100) * state.sizes[state.latestResizableTool]).toFixed(1), 0.1).toFixed(1)}
							</text>
							{/* <rect height={'100%'} width={2} fill='red' x={'50%'} y={'0%'} transform={`translate(-1, 0)`}></rect> */}
							{/* <rect width={'100%'} height={2} fill='red' y={'50%'} x={'0%'} transform={`translate(0, -1)`}></rect> */}
							{/* <image href='./pencil.svg' width={24} height={24} x={'50%'} y={'50%'} transform={`translate(${-12 + -props.calculateTextWidth('99.9', 16)},-12)`}></image>; */}
							{/* <image href='./pencil.svg' width={24} height={24} x={'50%'} y={'50%'} transform={`translate(${-30},-12)`}></image>; */}
						</svg>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: state.controlTop ? 'flex-start' : 'center',
							alignItems: state.controlTop ? 'center' : 'flex-end',
							width: state.controlTop ? 285 : 132,
							height: state.controlTop ? 132 : 285,
						}}
					>
						<Grid height={8} spacing={5} direction={state.controlTop ? 'column' : 'row'} groupDirection={state.controlTop ? 'row' : 'column-reverse'}>
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
								marginRight: state.controlTop ? 25 : 0,
								marginTop: state.controlTop ? 0 : 25,
							}}
							height={2}
							direction={state.controlTop ? 'row' : 'column-reverse'}
							groupDirection={state.controlTop ? 'column' : 'row'}
							spacing={4}
						>
							{['pencil', 'ruler', 'eraser', 'picker', 'text', 'trash'].map((tool) => {
								return (
									<Circle size={40.5} className={'button'} color={state.tool == tool ? '#959595' : 'black'} onClick={() => onToolChange(tool)}>
										<SVGFontIcon color='#c5c5c5' size='32' unicode={fontIcons[tool]} />
										{/* <text
											x='50%'
											y='50%'
											dominantBaseline='middle'
											textAnchor='middle'
											style={{
												fontFamily: 'icomoon',
												fill: '#c5c5c5',
												fontSize: '32px',
											}}
											transform='translate(0, 5)'
										>
											{fontIcons[tool]}
										</text> */}
									</Circle>
								);
							})}
							{/* <Circle size={40.5} className={'button'} color={state.tool == 'pencil' ? '#959595' : 'black'} onClick={() => onToolChange('pencil')}>
								<image href='./default-icons/pencil.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'ruler' ? '#959595' : 'black'} onClick={() => onToolChange('ruler')}>
								<image href='./default-icons/ruler.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'eraser' ? '#959595' : 'black'} onClick={() => onToolChange('eraser')}>
								<image href='./default-icons/eraser.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'picker' ? '#959595' : 'black'} onClick={() => onToolChange('picker')}>
								<image href='./default-icons/picker.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'text' ? '#959595' : 'black'} onClick={() => onToolChange('text')}>
								<image href='./default-icons/text.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'trash' ? '#959595' : 'black'} onClick={() => onToolChange('trash')}>
								<image href='./default-icons/trash.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
							</Circle> */}
						</Grid>
						<Grid height={2} spacing={4} groupDirection={state.controlTop ? 'column' : 'row'} direction={state.controlTop ? 'row' : 'column-reverse'}>
							<Circle
								size={40.5}
								className={'button'}
								onClick={() => {
									props.onToolChange.current('');
									props.onDownload.current();
								}}
							>
								<SVGFontIcon color='#c5c5c5' size='32' unicode={fontIcons['download']} />
								{/* <image href='./default-icons/download.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image> */}
							</Circle>
							<Circle
								size={40.5}
								className={'button'}
								onClick={() => {
									props.onReset.current();
									reset();
								}}
							>
								<SVGFontIcon color='#c5c5c5' size='32' unicode={fontIcons['reset']} />
								{/* <image href='./default-icons/reset.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image> */}
							</Circle>
							<Circle size={40.5} className={'button'} color={state.tool == 'hand' ? '#959595' : 'black'} onClick={() => onToolChange('hand')}>
								<SVGFontIcon color='#c5c5c5' size='32' unicode={fontIcons['hand']} />
								{/* <image href='./default-icons/hand.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image> */}
							</Circle>
						</Grid>
					</div>

					{!state.controlTop ? (
						<InputField
							inputWidth={127}
							id='name'
							onChange={props.onNameChange}
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
						<InputField
							inputWidth={329}
							id='name'
							onChange={props.onNameChange}
							onFocus={() => setState({ ...state, nameFocus: true })}
							underline
							underlineStyle={{
								height: 2,
								width: 329,
								marginBottom: 11,
							}}
						/>
					) : undefined}
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
		</div>
	);
};

export default Control;

// class Control extends React.Component {
// 	constructor() {
// 		super();

// 		this.maxSize = 10;

// 		this.resizableTools = ['ruler', 'pencil', 'eraser'];
// 		this.state = {
// 			controlTop: true,
// 			controlHidden: false,
// 			color: '#000000',
// 			tool: 'pencil',
// 			latestResizableTool: 'pencil',
// 			movingIndicator: false,
// 			sizes: Object.assign(
// 				{},
// 				...this.resizableTools.map((tool) => {
// 					return {
// 						[tool]: 100 / this.maxSize,
// 					};
// 				})
// 			),
// 		};

// 		this.indicator = React.createRef(null);
// 		this.hidden = React.createRef(null);
// 		this.control = React.createRef(null);
// 		this.colors = [
// 			'#FFFFFF',
// 			'#A8A8A8',
// 			'#545454',
// 			'#000000',
// 			'#FE6A00',
// 			'#803400',
// 			'#0026FF',
// 			'#001280',
// 			'#804000',
// 			'#401F00',
// 			'#01FFFF',
// 			'#017F7E',
// 			'#FFD800',
// 			'#947C00',
// 			'#B100FE',
// 			'#590080',
// 			'#FE0000',
// 			'#800001',
// 			'#0094FE',
// 			'#00497E',
// 			'#00FF01',
// 			'#017F01',
// 			'#FF006E',
// 			'#7F0037',
// 		].map((color) => {
// 			return (
// 				<Circle
// 					size={25}
// 					color={color}
// 					className={'button'}
// 					onClick={() => {
// 						this.props.onColorChange(color);
// 						this.setState({
// 							...this.state,
// 							color: color,
// 						});
// 					}}
// 				/>
// 			);
// 		});
// 	}

// 	// hexToRGB(hex) {
// 	// 	return (hex = hex.replace('#', ''))
// 	// 		.match(new RegExp('(.{' + hex.length / 3 + '})', 'g'))
// 	// 		.map(function (l) {
// 	// 			return parseInt(hex.length % 2 ? l + l : l, 16);
// 	// 		})
// 	// 		.join(',');
// 	// }

// 	reset() {
// 		this.setState({
// 			...this.state,
// 			color: '#000000',
// 			tool: 'pencil',
// 			latestResizableTool: 'pencil',
// 			// movingIndicator: false,
// 			sizes: Object.assign(
// 				{},
// 				...this.resizableTools.map((tool) => {
// 					return {
// 						[tool]: 100 / this.maxSize,
// 					};
// 				})
// 			),
// 		});
// 	}

// 	getTextColor(backgroundColor, boolean = false) {
// 		let rgb = (backgroundColor = backgroundColor.replace('#', ''))
// 			.match(new RegExp('(.{' + backgroundColor.length / 3 + '})', 'g'))
// 			.map(function (l) {
// 				return parseInt(backgroundColor.length % 2 ? l + l : l, 16);
// 			})
// 			.join(',')
// 			.split(',');

// 		// let rgb = hexToRGB(backgroundColor).split(',');
// 		let exp = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 186;

// 		return boolean ? exp : exp ? '#000000' : '#ffffff';
// 	}

// 	getToolIndex(tool) {
// 		let mainIndex = this.resizableTools.findIndex((x) => x == this.state.tool);
// 		if (mainIndex < 0) return -1;

// 		let toolIndex = this.resizableTools.findIndex((x) => x == tool);
// 		if (toolIndex < 0) return -1;

// 		let tools = this.resizableTools.map((tool, index) => {
// 			return {
// 				index: Math.abs(mainIndex - index) > 1 ? -1 : index,
// 				tool: tool,
// 			};
// 		});

// 		// gett current tool index and subtract by 1 which is the center and see the difference and subtract the neighbours by the difference

// 		let diff = tools[mainIndex].index - 1;
// 		tools[mainIndex].index = 1;
// 		// console.log(`Diff: ${diff}`);
// 		// console.log(`Main Index: ${mainIndex}`);
// 		// console.log(`Left index: ${mainIndex - 1}`);
// 		// console.log(`Right index: ${mainIndex + 1}`);
// 		if (mainIndex - 1 > -1) tools[mainIndex - 1].index -= diff;
// 		if (mainIndex + 1 < tools.length) tools[mainIndex + 1].index -= diff;

// 		// console.log();

// 		// console.log(
// 		// 	tools.reduce(function (prev, curr) {
// 		// 		return prev.index < curr.index && prev.index > -1 && curr.index > -1 ? prev : curr;
// 		// 	})
// 		// );

// 		// console.log(tools);
// 		// tools.map();

// 		// let tools = [
// 		// 	{
// 		// 		index: index - 1,
// 		// 		tool: this.resizableTools[index - 1],
// 		// 	},
// 		// 	{
// 		// 		index: index,
// 		// 		tool: this.resizableTools[index],
// 		// 	},
// 		// 	{
// 		// 		index: index + 1,
// 		// 		tool: this.resizableTools[index + 1],
// 		// 	},
// 		// ];

// 		// tools.map((toolData, index) => {
// 		// 	if (toolData.index < 0) {
// 		// 		console.log(toolData);
// 		// 		// only three can fit
// 		// 		// if (toolData.index < 0 || toolData.index >= 3) {
// 		// 		for (var i = index - 1; i >= 0; i--) {
// 		// 			tools[i].index = tools[i].index - 1;
// 		// 		}
// 		// 		for (var i = index + 1; i < tools.length; i++) {
// 		// 			tools[i].index = tools[i].index + 1;
// 		// 		}
// 		// 	}
// 		// });

// 		// tools = tools.filter((tool) => tool.index >= 0 && tool.index < this.resizableTools.length);
// 		tools = tools.filter((tool) => tool.index >= 0);

// 		let resultIndex = tools.findIndex((x) => x.tool == tool);
// 		if (resultIndex < 0) return -1;
// 		// console.log(tools);
// 		return tools[resultIndex].index;
// 	}

// 	onToolChange(tool) {
// 		this.setState({
// 			...this.state,
// 			tool: tool,
// 			latestResizableTool: this.resizableTools.includes(tool) ? tool : this.state.latestResizableTool,
// 		});
// 		console.log(this.state.sizes);
// 	}

// 	getWindowDimensions() {
// 		const { innerWidth: width, innerHeight: height } = window;
// 		return {
// 			width,
// 			height,
// 		};
// 	}

// 	angle(cx, cy, ex, ey) {
// 		var dy = ey - cy;
// 		var dx = ex - cx;
// 		var theta = Math.atan2(dy, dx); // range (-PI, PI]
// 		theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
// 		theta -= 180;
// 		if (theta < 0) theta = 360 + theta; // range [0, 360)

// 		return theta;
// 	}

// 	onMouseDown(event) {
// 		let svgBounds = this.indicator.current.getBoundingClientRect();
// 		let handle = this.indicator.current.querySelector('#indicator-handle');
// 		let handleRadius = parseFloat(handle.getAttribute('r')) + 5; // extra padding;
// 		let x = parseFloat(handle.getAttribute('cx')) + svgBounds.x - handleRadius / 2;
// 		let y = parseFloat(handle.getAttribute('cy')) + svgBounds.y - handleRadius / 2;

// 		if (this.resizableTools.includes(this.state.tool)) {
// 			if (event.clientX >= x && event.clientX <= x + handleRadius) {
// 				if (event.clientY >= y && event.clientY <= y + handleRadius) {
// 					this.setState({
// 						...this.state,
// 						movingIndicator: true,
// 					});
// 				}
// 			}
// 		}
// 	}
// 	onMouseMove(event) {
// 		let svgBounds = this.indicator.current.getBoundingClientRect();
// 		let x = svgBounds.x + svgBounds.width / 2;
// 		let y = svgBounds.y + svgBounds.height / 2;

// 		// console.log(this.state.indicatorValue);
// 		// if(this.state.indicatorValue )
// 		if (this.state.movingIndicator) {
// 			let indicatorValue = this.angle(event.clientX, event.clientY, x, y) / 3.6;

// 			// if (indicatorValue - this.state.indicatorValue > 0) {
// 			// console.log('increase');
// 			// } else {
// 			// console.log('decrease');
// 			// }

// 			console.log(Math.abs(indicatorValue - this.state.indicatorValue));
// 			// if (Math.abs(indicatorValue - this.state.indicatorValue) < 50) {
// 			if (Math.abs(indicatorValue - this.state.sizes[this.state.tool]) < 50) {
// 				// if (indicatorValue <= 0) indicatorValue = 0.1;
// 				// console.log('Before')
// 				// console.log(this.state.sizes);
// 				this.setState(
// 					{
// 						...this.state,
// 						sizes: {
// 							...this.state.sizes,
// 							[this.state.tool]: indicatorValue,
// 						},
// 						// indicatorValue: indicatorValue,
// 					}
// 					// () => {
// 					// 	console.log('Before');
// 					// 	console.log(before);
// 					// 	console.log('After');
// 					// 	console.log(this.state.sizes);
// 					// }
// 				);
// 			} else {
// 				indicatorValue = [100, 0].reduce((a, b) => {
// 					// return Math.abs(b - this.state.indicatorValue) < Math.abs(a - this.state.indicatorValue) ? b : a;
// 					return Math.abs(b - this.state.sizes[this.state.tool]) < Math.abs(a - this.state.sizes[this.state.tool]) ? b : a;
// 				});
// 				// if (indicatorValue <= 0) indicatorValue = 0.1;

// 				this.setState({
// 					...this.state,
// 					sizes: {
// 						...this.state.sizes,
// 						[this.state.tool]: indicatorValue,
// 					},
// 					// indicatorValue: indicatorValue,
// 				});
// 				// this.
// 			}
// 			// console.log(this.state.indicatorValue);
// 			// console.log(indicatorValue);
// 			// console.log(this.state.indicatorValue);
// 		}
// 		// console.log((Math.atan2(event.clientY - y, event.clientX - x) * 180) / Math.PI);
// 	}

// 	onMouseUp(event) {
// 		this.setState({
// 			...this.state,
// 			movingIndicator: false,
// 		});
// 	}

// 	componentDidMount() {
// 		let dimensions = this.getWindowDimensions();
// 		let controlTop = dimensions.width >= 702 + 50;
// 		this.setState({
// 			...this.state,
// 			controlTop: controlTop,
// 			// controlVisible: controlTop ? dimensions.height >= 168 + 25 : dimensions.width >= 168 + 25,
// 		});

// 		window.onresize = () => {
// 			let dimensions = this.getWindowDimensions();
// 			let controlTop = dimensions.width >= 702 + 50;
// 			this.setState({
// 				...this.state,
// 				controlTop: controlTop,
// 				// controlVisible: controlTop ? dimensions.height >= 168 + 25 : dimensions.width >= 168 + 25,
// 			});
// 		};

// 		window.onmousedown = this.onMouseDown.bind(this);
// 		window.onmousemove = this.onMouseMove.bind(this);
// 		window.onmouseup = this.onMouseUp.bind(this);
// 	}

// 	toggleControl() {
// 		this.control.current.style.transition = '0.1s cubic-bezier(0, -0.02, 0, 1)';
// 		setTimeout(() => {
// 			this.control.current.style.transition = 'none';
// 		}, 100);

// 		this.setState({ ...this.state, controlHidden: !this.state.controlHidden }, () => {
// 			console.log(this.state.controlHidden);
// 		});
// 	}

// 	render() {
// 		return (
// 			<div
// 				ref={this.control}
// 				style={{
// 					width: '100%',
// 					height: '100%',
// 					position: 'fixed',
// 					top: 0,
// 					left: 0,
// 					marginTop: this.state.controlTop ? (this.state.controlHidden ? -168 : 0) : 0,
// 					marginLeft: !this.state.controlTop ? (this.state.controlHidden ? -168 : 0) : 0,
// 					// display: this.state.controlVisible ? 'flex' : 'none',
// 					display: 'flex',
// 					flexDirection: this.state.controlTop ? 'column' : 'row',
// 					transition: 'none',
// 					alignItems: 'center',
// 				}}
// 			>
// 				<div
// 					style={{
// 						backgroundColor: 'rgba(0.26666666666, 0.26666666666, 0.26666666666, 0.55)',
// 						width: this.state.controlTop ? 702 : 168,
// 						height: this.state.controlTop ? 168 : 702,
// 						borderRadius: `0px ${this.state.controlTop ? '0px 36px 36px' : '36px 36px 0px'}`,
// 						display: 'flex',
// 						flexDirection: this.state.controlTop ? 'column' : 'row',
// 					}}
// 				>
// 					<div
// 						style={{
// 							width: this.state.controlTop ? '100%' : 132,
// 							height: this.state.controlTop ? 132 : '100%',
// 							display: 'flex',
// 							flexDirection: this.state.controlTop ? 'row' : 'column-reverse',
// 						}}
// 					>
// 						<div
// 							style={{
// 								width: this.state.controlTop ? 146 : 132,
// 								height: this.state.controlTop ? 132 : 146,
// 								display: 'flex',
// 								alignItems: 'center',
// 								justifyContent: 'center',
// 								// opacity: this.resizableTools.includes(this.state.tool) ? 1 : 0.5,
// 							}}
// 						>
// 							<svg width='120' height='120' ref={this.indicator} id='indicator'>
// 								<defs>
// 									<mask id='borderMask'>
// 										<circle cx='60' cy='60' r='50' fill='white' />
// 									</mask>
// 								</defs>
// 								<circle
// 									cx='60'
// 									cy='60'
// 									r='50'
// 									// stroke={this.getTextColor(this.state.color)}
// 									stroke={this.resizableTools.includes(this.state.tool) ? this.getTextColor(this.state.color) : 'transparent'}
// 									fill={this.state.color}
// 									strokeWidth='15'
// 									strokeDasharray={Math.PI * 100}
// 									// strokeDashoffset={((100 - this.state.indicatorValue) / 100) * (Math.PI * 100)}
// 									strokeDashoffset={((100 - this.state.sizes[this.state.latestResizableTool]) / 100) * (Math.PI * 100)}
// 									mask='url(#borderMask)'
// 									style={{
// 										transition: 'stroke 0.2s',
// 									}}
// 								/>
// 								{/* {(() => {
// 									let angle = this.state.sizes[this.state.tool] * 3.6;
// 									let origin = {
// 										x: 60,
// 										y: 60,
// 									};
// 									let mainR = 7;
// 									let r = 50 - mainR / 2;
// 									let x = r * Math.cos((angle * Math.PI) / 180) + origin.x;
// 									let y = r * Math.sin((angle * Math.PI) / 180) + origin.y;

// 									return <circle cx={x} cy={y} r={mainR} fill='white' id='indicator-handle'></circle>;
// 								})()} */}
// 								<circle
// 									cx={46.5 * Math.cos((this.state.sizes[this.state.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
// 									cy={46.5 * Math.sin((this.state.sizes[this.state.latestResizableTool] * 3.6 * Math.PI) / 180) + 60}
// 									// cx={46.5 * Math.cos((this.state.sizes[this.state.tool] * 3.6 * Math.PI) / 180) + 60}
// 									// cy={46.5 * Math.cos((this.state.sizes[this.state.tool] * 3.6 * Math.PI) / 180) + 60}
// 									r={this.resizableTools.includes(this.state.tool) ? 7 : 0}
// 									// fill={this.resizableTools.includes(this.state.tool) ? this.getTextColor(this.state.color) : this.state.color}
// 									fill={this.getTextColor(this.state.color)}
// 									id='indicator-handle'
// 									style={{
// 										transition: '0.2s',
// 										transitionProperty: 'r, fill',
// 									}}
// 								></circle>
// 								{this.resizableTools.map((tool) => {
// 									return (
// 										<image
// 											href={`./${this.getTextColor(this.state.color, true) ? 'black' : 'white'}-icons/${tool}.svg`}
// 											width={this.getToolIndex(tool) > -1 ? (this.state.tool != tool ? 18 : 24) : 0}
// 											width={this.getToolIndex(tool) > -1 ? (this.state.tool != tool ? 18 : 24) : 0}
// 											x={'50%'}
// 											y={'50%'}
// 											// transform={['translate(12, -28)', 'translate(-12, -28)', 'translate(-28, -28)'][this.getToolIndex(tool)]}
// 											transform={(() => {
// 												let index = this.getToolIndex(tool);
// 												console.log(`${tool} index ${index}`);
// 												// console.log(index);
// 												return ['translate(-28, -28)', 'translate(-12, -28)', 'translate(12, -28)'][index];
// 											})()}
// 											style={{ opacity: this.state.tool == tool ? 1 : 0.5, transition: '0.2s' }}
// 											fill='red'
// 										></image>
// 									);
// 								})}

// 								<text
// 									x='50%'
// 									y='50%'
// 									dominantBaseline='middle'
// 									textAnchor='middle'
// 									fill={this.resizableTools.includes(this.state.tool) ? this.getTextColor(this.state.color) : 'transparent'}
// 									style={{
// 										fontFamily: 'JannaLT',
// 										fontSize: '16px',
// 										transition: 'fill 0.2s',
// 									}}
// 									transform={`translate(0, 8)`}
// 								>
// 									{/* {Math.max(((this.maxSize / 100) * this.state.indicatorValue).toFixed(1), 0.1).toFixed(1)} */}
// 									{Math.max(((this.maxSize / 100) * this.state.sizes[this.state.latestResizableTool]).toFixed(1), 0.1).toFixed(1)}
// 								</text>
// 								{/* <rect height={'100%'} width={2} fill='red' x={'50%'} y={'0%'} transform={`translate(-1, 0)`}></rect> */}
// 								{/* <rect width={'100%'} height={2} fill='red' y={'50%'} x={'0%'} transform={`translate(0, -1)`}></rect> */}
// 								{/* <image href='./pencil.svg' width={24} height={24} x={'50%'} y={'50%'} transform={`translate(${-12 + -this.props.calculateTextWidth('99.9', 16)},-12)`}></image>; */}
// 								{/* <image href='./pencil.svg' width={24} height={24} x={'50%'} y={'50%'} transform={`translate(${-30},-12)`}></image>; */}
// 							</svg>
// 						</div>

// 						<div
// 							style={{
// 								display: 'flex',
// 								justifyContent: this.state.controlTop ? 'flex-start' : 'center',
// 								alignItems: this.state.controlTop ? 'center' : 'flex-end',
// 								width: this.state.controlTop ? 285 : 132,
// 								height: this.state.controlTop ? 132 : 285,
// 							}}
// 						>
// 							<Grid height={8} spacing={5} direction={this.state.controlTop ? 'column' : 'row'} groupDirection={this.state.controlTop ? 'row' : 'column-reverse'}>
// 								{this.colors}
// 							</Grid>
// 						</div>

// 						<div
// 							style={{
// 								display: 'flex',
// 								alignItems: 'center',
// 								justifyContent: 'flex-start',
// 								flexDirection: this.state.controlTop ? 'row' : 'column-reverse',
// 								width: this.state.controlTop ? 271 : 132,
// 								height: this.state.controlTop ? 132 : 271,
// 							}}
// 						>
// 							<Grid
// 								style={{
// 									marginRight: this.state.controlTop ? 25 : 0,
// 									marginTop: this.state.controlTop ? 0 : 25,
// 								}}
// 								height={2}
// 								direction={this.state.controlTop ? 'row' : 'column-reverse'}
// 								groupDirection={this.state.controlTop ? 'column' : 'row'}
// 								spacing={4}
// 							>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'pencil' ? '#959595' : 'black'} onClick={() => this.onToolChange('pencil')}>
// 									<image href='./default-icons/pencil.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'ruler' ? '#959595' : 'black'} onClick={() => this.onToolChange('ruler')}>
// 									<image href='./default-icons/ruler.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'eraser' ? '#959595' : 'black'} onClick={() => this.onToolChange('eraser')}>
// 									<image href='./default-icons/eraser.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'picker' ? '#959595' : 'black'} onClick={() => this.onToolChange('picker')}>
// 									<image href='./default-icons/picker.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'text' ? '#959595' : 'black'} onClick={() => this.onToolChange('text')}>
// 									<image href='./default-icons/text.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'trash' ? '#959595' : 'black'} onClick={() => this.onToolChange('trash')}>
// 									<image href='./default-icons/trash.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 							</Grid>
// 							<Grid height={2} spacing={4} groupDirection={this.state.controlTop ? 'column' : 'row'} direction={this.state.controlTop ? 'row' : 'column-reverse'}>
// 								<Circle size={40.5} className={'button'}>
// 									<image href='./default-icons/download.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} onClick={this.reset.bind(this)}>
// 									<image href='./default-icons/reset.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 								<Circle size={40.5} className={'button'} color={this.state.tool == 'hand' ? '#959595' : 'black'} onClick={() => this.onToolChange('hand')}>
// 									<image href='./default-icons/hand.svg' width={32} height={32} x={'50%'} y={'50%'} transform='translate(-16,-16)'></image>
// 								</Circle>
// 							</Grid>
// 						</div>

// 						{!this.state.controlTop ? (
// 							<InputField
// 								inputWidth={127}
// 								style={{
// 									backgroundColor: 'black',
// 									height: 2,
// 									width: 127,
// 									marginBottom: 11,
// 								}}
// 								onNameChange={this.props.onNameChange}
// 							/>
// 						) : undefined}
// 					</div>

// 					<div
// 						style={{
// 							width: this.state.controlTop ? '100%' : 36,
// 							height: this.state.controlTop ? 36 : '100%',
// 							display: 'flex',
// 							justifyContent: 'flex-start',
// 							flexDirection: 'column',
// 							alignItems: 'center',
// 						}}
// 					>
// 						{this.state.controlTop ? (
// 							<InputField
// 								inputWidth={329}
// 								style={{
// 									height: 2,
// 									width: 329,
// 									marginBottom: 11,
// 								}}
// 								onNameChange={this.props.onNameChange}
// 							/>
// 						) : undefined}
// 					</div>
// 				</div>
// 				<div
// 					style={{
// 						backgroundColor: 'rgba(0.26666666666, 0.26666666666, 0.26666666666, 0.55)',
// 						width: this.state.controlTop ? 32 : 18,
// 						height: this.state.controlTop ? 18 : 32,
// 						borderRadius: `0px ${this.state.controlTop ? '0px 8px 8px' : '8px 8px 0px'}`,
// 						display: 'flex',
// 						justifyContent: 'center',
// 						alignItems: 'center',
// 					}}
// 					onClick={this.toggleControl.bind(this)}
// 				>
// 					<img
// 						style={{
// 							transform: this.state.controlTop ? (this.state.controlHidden ? 'rotate(180deg)' : 'rotate(0deg)') : this.state.controlHidden ? 'rotate(90deg)' : 'rotate(-90deg)',
// 						}}
// 						src='./upwards-arrow.svg'
// 						width='12'
// 						height='12'
// 					></img>
// 				</div>
// 			</div>
// 		);
// 	}
// }
