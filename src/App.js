import React, { useState, useRef, useEffect } from 'react';
// import PaperCanvas from './components/PaperCanvas.js';
// const App = () => {
// 	return <PaperCanvas />;
// };
// export default App;

import Control from './components/Control.js';
import Whiteboard from './components/Whiteboard.js';
import Collaboration from './components/Collaboration.js';
import './App.css';
import IcoMoon from './components/IcoMoon.js';

// make control bar unresizable when zooming
// grid control

// const uuid = () => Date.now().toString() + Math.floor(Math.random(1, 9) * 1000000).toString();

const App = (props) => {
	const [state, setState] = useState({
		color: '#000000',
	});

	const isMouseOverControl = useRef(null);
	const getControlData = useRef(null);
	const changeControlColor = useRef(null);
	const hiddenInput = useRef(null);

	const onReset = useRef(null);
	const onDownload = useRef(null);
	const onWrite = useRef(null);
	const onSubmit = useRef(null);
	const onToolChange = useRef(null);
	const whiteboardRefs = {
		onMouseDown: useRef(null),
		onMouseUp: useRef(null),
		onMouseMove: useRef(null),
	};

	// useEffect(() => {
	// console.log(hiddenInput);
	// console.log(control.current());
	// }, []);
	// const hidden = useRef(null);

	// const calculateTextWidth = (text, size) => {
	// 	if (hidden.current == null) return 0;

	// 	hidden.current.style.fontSize = size;
	// 	hidden.current.innerHTML = text;

	// 	return hidden.current.clientWidth;
	// }, []);

	return (
		<div
			className='App'
			style={{
				overflow: 'hidden',
				fontFamily: 'JannaLT',
			}}
		>
			{/* <div
				ref={hidden}
				style={{
					position: 'absolute',
					visibility: 'hidden',
					height: 'auto',
					width: 'auto',
					whiteSpace: 'nowrap',
					fontFamily: 'JannaLT',
					fontSize: '16px',
				}}
			>
				&nbsp;
			</div> */}

			{/* <Control calculateTextWidth={calculateTextWidth} onColorChange={(color) => setState({ ...state, color: color })} onNameChange={() => {}} onToolChange={() => {}} /> */}

			<Whiteboard
				onMouseDown={whiteboardRefs.onMouseDown}
				onMouseMove={whiteboardRefs.onMouseMove}
				onMouseUp={whiteboardRefs.onMouseUp}
				getControlData={getControlData}
				isMouseOverControl={isMouseOverControl}
				changeControlColor={changeControlColor}
				onDownload={onDownload}
				onReset={onReset}
				onWrite={onWrite}
				onSubmit={onSubmit}
				onToolChange={onToolChange}
				hiddenInput={hiddenInput}
			/>
			<Collaboration getControlData={getControlData} />
			<Control
				whiteboardRefs={whiteboardRefs}
				getControlData={getControlData}
				changeControlColor={changeControlColor}
				isMouseOverControl={isMouseOverControl}
				onColorChange={(color) => setState({ ...state, color: color })}
				onDownload={onDownload}
				onReset={onReset}
				onWrite={onWrite}
				onSubmit={onSubmit}
				onToolChange={onToolChange}
				hiddenInput={hiddenInput}
				onNameChange={() => {}}
			/>
		</div>
	);
};

// class App extends React.Component {
// 	constructor() {
// 		super();

// 		this.state = {
// 			color: '#000000',
// 		};
// 		this.hidden = React.createRef(null);
// 	}

// 	calculateTextWidth(text, size) {
// 		if (this.hidden.current == null) return 0;

// 		this.hidden.current.style.fontSize = size;
// 		this.hidden.current.innerHTML = text;

// 		return this.hidden.current.clientWidth;
// 	}

// 	render() {
// 		return (
// 			<div
// 				className='App'
// 				style={{
// 					overflow: 'hidden',
// 					fontFamily: 'JannaLT',
// 				}}
// 			>
// 				<div
// 					ref={this.hidden}
// 					style={{
// 						position: 'absolute',
// 						visibility: 'hidden',
// 						height: 'auto',
// 						width: 'auto',
// 						whiteSpace: 'nowrap',
// 						fontFamily: 'JannaLT',
// 						fontSize: '16px',
// 					}}
// 				>
// 					&nbsp;
// 				</div>

// 				<Control
// 					calculateTextWidth={this.calculateTextWidth.bind(this)}
// 					onColorChange={(color) => this.setState({ color: color, ...this.state })}
// 					onNameChange={() => {}}
// 					onToolChange={() => {}}
// 				/>
// 			</div>
// 		);
// 	}
// }

export default App;
