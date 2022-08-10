import React, { useEffect, useRef } from 'react';
import { useWebSocketContext } from '../contexts/WebSocketContext.jsx';
import { useNameContext } from '../contexts/NameContext.jsx';
import useControlHook from '../hooks/ControlHook.js';
import rfc6455 from '../../rfc6455.js';

// Websocket ready states
// 0: CONNECTING, Socket has been created. The connection is not yet open.
// 1: OPEN, The connection is open and ready to communicate.
// 2: CLOSING, The connection is in the process of closing.
// 3: CLOSED, The connection is closed or couldn't be opened.

export default function useWebSocket() {
	// Our shared state:

	let webSocketContext = useWebSocketContext();
	let webSocket = webSocketContext.webSocket;
	let _setWebSocket = webSocketContext.setWebSocket;
	const { name } = useNameContext();
	const { createLog } = useControlHook();

	const sendDataToServer = (data) => {
		// if the websocket's ready state is not OPEN, don't send a message
		// if (webSocket.ws.readyState !== 1) return console.error(`Failed to send message, the websocket is not open yet`);
		if (webSocket.ws.readyState !== 1) return;
		webSocket.ws.send(JSON.stringify(data));
	};

	const uuid = () => Date.now().toString() + Math.floor(Math.random(1, 9) * 1000000).toString();

	const _webSocket = useRef(webSocket);
	const setWebSocket = (data) => {
		_webSocket.current = data;
		_setWebSocket(data);
	};

	useEffect(() => {
		// default room
		if (window.location.pathname == '/') {
			window.location.pathname = '/lobby';
			return;
		}

		if (document.cookie == null || document.cookie == '') {
			document.cookie = `id=${uuid()}`;
			console.log('Generated new cookie');
		}
		console.log(`Cookie: ${document.cookie}`);

		webSocket.ws.onopen = (event) => {
			createLog(`Connected: Websocket has opened at ${webSocket.wsURL}`);
			console.log(`Connected succesfully as ${document.cookie}`);

			// window.addEventListener('mousemove', onMouseMove);

			sendDataToServer({
				event: 'connect',
				id: document.cookie,
				room: window.location.pathname.slice(1),
				name: name.name,
			});
		};
	}, []);

	useEffect(() => {
		sendDataToServer({
			event: 'rename',
			id: document.cookie,
			name: name.name,
		});

		webSocket.ws.onclose = (event) => {
			createLog(`${rfc6455[event.code] || 'Unknown reason'}${event.reason}`, 'error', true);
		};

		webSocket.ws.onerror = (error) => {
			createLog(`Websocket Error: ${error.data}`, 'error');
		};

		webSocket.ws.onmessage = (event) => {
			let msg = JSON.parse(event.data);

			switch (msg.event) {
				case 'error':
					console.log(`Server error: ${msg.error.toString()}`);
					break;
				case 'disconnect':
					console.log('Attempting to disconnect...');
					webSocket.ws.close(3000, `${msg.reason}`);
					break;
				case 'fetch-room':
					let room = {
						users: msg.data.users.filter((user) => user.socket != document.cookie),
						data: msg.data.data,
					};

					let oldUsers = _webSocket.current.room.users;
					let newUsers = room.users;

					// check which users disconnected and connected and find out how to make it into a single sentence
					console.log(`Old Users: ${JSON.stringify(oldUsers)}`);
					console.log(`New Users: ${JSON.stringify(newUsers)}`);

					// let users = msg.data.filter((user) => user.socket != document.cookie);
					setWebSocket({
						...webSocket,
						// users: users,
						room: room,
					});
					break;
				case 'ping':
					sendDataToServer({
						event: 'ping',
					});
					break;
			}
		};

		return () => {
			webSocket.ws.onopen = null;
			webSocket.ws.onclose = null;
			webSocket.ws.onerror = null;
			webSocket.ws.onmessage = null;
		};
	}, [name.name]);

	// join and leave notifier
	useEffect(() => {
		console.log(webSocket.room);
	}, [webSocket.room]);
	// const [state, setState] = useState({
	// 	fooColor: 'No color picked yet',
	// 	barColor: 'No color picked yet',
	// });

	// Then we can add a parameter in order to avoid function duplication:
	// const changeColorToRed = (comp) => {
	// 	console.log(comp);
	// 	switch (comp) {
	// 		case 'foo':
	// 			console.log(comp);
	// 			console.log(main);
	// 			setMain({
	// 				// Spread the existing contents of the main (`barColor` in this case):
	// 				...main,
	// 				fooColor: 'red',
	// 			});
	// 			break;
	// 		case 'bar':
	// 			setMain({
	// 				...main,
	// 				barColor: 'red',
	// 			});
	// 			break;
	// 	}
	// };

	// const changeColorToGreen = (comp) => {
	// 	console.log(comp);

	// 	switch (comp) {
	// 		case 'foo':
	// 			setMain({
	// 				// Spread the existing contents of the main (`barColor` in this case):
	// 				...main,
	// 				fooColor: 'green',
	// 			});
	// 			break;

	// 		case 'bar':
	// 			setMain({
	// 				...main,
	// 				barColor: 'green',
	// 			});
	// 			break;
	// 	}
	// };

	// // Our methods:
	// const changeColorToBlue = (comp) => {
	// 	console.log(comp);
	// 	switch (comp) {
	// 		case 'foo':
	// 			setMain({
	// 				// Spread the existing contents of the main (`barColor` in this case):
	// 				...main,
	// 				fooColor: 'blue',
	// 			});
	// 			break;

	// 		case 'bar':
	// 			setMain({
	// 				...main,
	// 				barColor: 'blue',
	// 			});
	// 			break;
	// 	}
	// };

	return {
		sendDataToServer,
		uuid,
	};
}
