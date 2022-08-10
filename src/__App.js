import React, { useState, useRef, useEffect } from 'react';

const App = (props) => {
	const [state, _setState] = useState({
		tasks: [],
		active: { status: false, task: undefined },
	});

	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	useEffect(() => {
		console.log('initialized');
		setTimeout(function () {
			for (let i = 0; i < 6; i++) {
				addTask();
			}
			console.log('added tasks');
		}, 1000);
	}, []);

	useEffect(() => {
		if (_state.current.tasks.length == 0) return;
		if (_state.current.active.status) return;

		setState({ ..._state.current, active: { status: true, task: _state.current.tasks[0] } });

		setTimeout(function () {
			setState({
				active: { status: false, task: undefined },
				tasks: _state.current.tasks.slice(1),
			});
		}, 2000);
	}, [state.tasks]);

	const addTask = () => {
		setState({
			..._state.current,
			tasks: _state.current.tasks.concat([`task ${_state.current.tasks.length + 1}`]),
		});
	};

	return (
		<div className='App'>
			<button onClick={addTask}>Add Task</button>
			<div>Status: {state.active.status ? `Active on "${state.active.task}"` : 'Idle'}</div>
			<div>Current task length: {state.tasks.length}</div>
			<div>
				{state.tasks.map((task) => {
					return (
						<div>
							{task}
							<br />
						</div>
					);
				})}
			</div>
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
