import React, { useState, useRef, useEffect } from 'react';
// import PaperCanvas from './components/PaperCanvas.js';
// const App = () => {
// 	return <PaperCanvas />;
// };
// export default App;

import Control from './components/Control.js';
import Whiteboard from './components/Whiteboard.js';
import './App.css';

import { WebSocketContextProvider } from './components/contexts/WebSocketContext.jsx';
import { ControlContextProvider } from './components/contexts/ControlContext.jsx';
import { NameContextProvider } from './components/contexts/NameContext.jsx';
import { LogContextProvider } from './components/contexts/LogContext.jsx';

// DONT FORGET TO RE ENABLE MOVEMENT SENDING MESSAGES FROM CLIENT BEFORE PUBLICHSING

// optimization bugs:
// using the method to reset event listeners everytime the state has changed: (* fixed: issue was because it was running from its own event listener, not from contrl's event listener i dont know why)
// when using the mousedown and mousemove event listener, and when holding the mouse and immediately moving, will run both mousedown and mousemove before resetting event listeners
// so the problem here is if both of them change the state, the 2 state changes will occur at the same time,
// thus after the first state change, the events will be reset and then the second state change will be executed and overlaps the first state change
//
// accessing the context state inside of an event listener:
// there is no other way than resetting event listeners, and if i were to use refs, the ref would change when the control chagne
// but what if the contorl chagnes in another componet, how would the change be changed in my ref in my other component in another file
// do i use a ref inside of the context, or use a hook ?
// do i chagne the funciton of setControl in the context and change it in the "value"
// and set the [state, setControl] to [state, _setControl] and then use that function to change a ref, and then use that ref somewhere
// maybe use that ref in the "value" or somewhere
//
// listening to a window event in multiple components (e.g: 'mousedown', 'mouseup'), without duplicating it in the useEffect and having to remove it everytime:
// how would you do that without removing and still access the state correctly, you have to reset the event listener, would you use something in a hook maybe?
// maybe the hook has an array in it of events, but that wouldn't work beacuse how  would you reset a  function in the array
// maybe you could make it so each function has a tag with it so when a callback is added to the array you need a tag to identify it, so when you use -
// useEffect to listen for changes in the state, you could set the callback again but with the same tag so that callback in the array with the same tag,
// would be removed and replaced with yours and the event would be reset

// optimization suggestions:
// see if there is a better way to access state in an event listener without having to remove it and create it everytime when the state changes in useEffect
//
// combine all states into one context, so when using useEffect on it, say main.control, main.whiteboard, main.textarea or something

// make control bar unresizable when zooming
// grid control
// clear your timeouts in useEffect (see here for more info: https://felixgerschau.com/react-hooks-settimeout/)

// send an image to delict before user leaves, by saving the image constantly to the server and as soon as he leaves the image will be sent back to discord all the images
// **
// while a user is logged in, save the paper project data every minute or so in the server attached to his name, as soon as he disconnects, send the data to the discord in a json file
// then create a local program to analyze the data with javascript, by copying the delict-react folder and goign on tfrom there

// create color picker preview or some way to know what pixel im currently on for precise control
// or just make it so when you hold down the mouse it color picks all colors on the mouse

// when sending logs of users connecting and disconnecting,
// in some cases, the connect comes immediately after disconnect, which is most likely a reconnection, so find out a way to check if it is a reconnection or a disconnection and log that accordingly

// warning when trashing when zoomed out very far

// create a single context for logs only

const App = (props) => {
	const changeControlColor = useRef(null);
	const hiddenInput = useRef(null);
	const switchIndex = useRef(null);

	const onReset = useRef(null);
	const onWrite = useRef(null);
	const onSubmit = useRef(null);
	const onToolChange = useRef(null);
	const whiteboardRefs = {
		onMouseDown: useRef(null),
		onMouseUp: useRef(null),
		onMouseMove: useRef(null),
	};

	const onRoomDataChange = useRef(null);

	// useEffect(() => {
	// 	console.log(collaboration.current);
	// 	// console.log(hiddenInput);
	// 	// console.log(control.current());
	// 	// }, []);
	// 	// const hidden = useRef(null);

	// 	// const calculateTextWidth = (text, size) => {
	// 	// 	if (hidden.current == null) return 0;

	// 	// 	hidden.current.style.fontSize = size;
	// 	// 	hidden.current.innerHTML = text;

	// 	// 	return hidden.current.clientWidth;
	// }, []);

	return (
		<div
			className='App'
			style={{
				overflow: 'hidden',
				fontFamily: 'JannaLT',
			}}
		>
			<ControlContextProvider>
				<WebSocketContextProvider>
					<NameContextProvider>
						<LogContextProvider>
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

							<Whiteboard
								onMouseDown={whiteboardRefs.onMouseDown}
								onMouseMove={whiteboardRefs.onMouseMove}
								onMouseUp={whiteboardRefs.onMouseUp}
								changeControlColor={changeControlColor}
								switchIndex={switchIndex}
								onReset={onReset}
								onWrite={onWrite}
								onSubmit={onSubmit}
								onToolChange={onToolChange}
								hiddenInput={hiddenInput}
								onRoomDataChange={onRoomDataChange}
							/>
							<Control
								whiteboardRefs={whiteboardRefs}
								changeControlColor={changeControlColor}
								onReset={onReset}
								onWrite={onWrite}
								onSubmit={onSubmit}
								switchIndex={switchIndex}
								onToolChange={onToolChange}
								hiddenInput={hiddenInput}
							/>
						</LogContextProvider>
					</NameContextProvider>
				</WebSocketContextProvider>
			</ControlContextProvider>
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
