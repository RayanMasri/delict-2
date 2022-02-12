import React, { useEffect, useRef, useState } from 'react';

let wsURL = `ws://localhost:8000`;
var ws = new WebSocket(wsURL, 'echo-protocol');

const Collaboration = (props) => {
	const [state, _setState] = useState({
		users: [],
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const send = (data) => ws.send(JSON.stringify(data));
	const uuid = () => Date.now().toString() + Math.floor(Math.random(1, 9) * 1000000).toString();

	const onMouseMove = (event) => {
		send({
			event: 'move',
			id: document.cookie,
			room: window.location.pathname.slice(1),
			position: {
				x: event.clientX,
				y: event.clientY,
			},
		});
	};

	useEffect(() => {
		if (window.location.pathname == '/') {
			window.location.pathname = '/lobby';
			return;
		}

		if (document.cookie == null || document.cookie == '') {
			document.cookie = `id=${uuid()}`;
			console.log('Generated new cookie');
		}
		console.log(`Cookie: ${document.cookie}`);

		ws.onopen = (event) => {
			console.log('WS: Connection has opened.');

			window.addEventListener('mousemove', onMouseMove);

			send({
				event: 'connect',
				id: document.cookie,
				room: window.location.pathname.slice(1),
			});
		};

		ws.onclose = () => {
			console.log('WS: Connection has closed.');
		};

		ws.onerror = (error) => console.error(`WS: An error has occured. ${error.data}`);

		ws.onmessage = (event) => {
			let data = JSON.parse(event.data);

			switch (data.event) {
				case 'error':
					console.log(`Server error: ${data.error.toString()}`);
					break;
				case 'disconnect':
					console.log('Attempting to disconnect...');
					ws.close();
					break;
				case 'fetch-room':
					setState({
						...state,
						users: data.data.filter((user) => user.socket != document.cookie),
					});
					break;
				case 'ping':
					send({
						event: 'ping',
					});
					break;
			}
		};
	}, []);

	return (
		<div
			style={{
				position: 'fixed',
				top: '0',
				left: '0',
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
			}}
		>
			<div className='users'>
				{state.users.map((user) => {
					return (
						<div
							key={user.socket}
							className='user'
							style={{
								top: user.position.y,
								left: user.position.x,
							}}
						>
							<div className='icon-pencil'></div>
							<div className='user-name'>{user.socket}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Collaboration;
