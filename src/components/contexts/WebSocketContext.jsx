import React, { useState } from 'react';

let wsURL = `ws://localhost:8000`;
var ws = new WebSocket(wsURL, 'echo-protocol');

let object = {
	ws: ws,
	wsURL: wsURL,
	room: {
		users: [],
		data: [],
	},
};

const WebSocketContext = React.createContext({
	webSocket: object,
	setWebSocket: (websocket) => {},
});

export function WebSocketContextProvider(props) {
	const [webSocket, setWebSocket] = useState(object);

	return <WebSocketContext.Provider value={{ webSocket, setWebSocket }}>{props.children}</WebSocketContext.Provider>;
}

export const useWebSocketContext = () => React.useContext(WebSocketContext);
