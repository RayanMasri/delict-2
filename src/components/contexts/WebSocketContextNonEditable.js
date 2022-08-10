import React from 'react';

const WebSocketContext = React.createContext({});

export function WebSocketContextProvider(props) {
	const wsURL = `ws://localhost:8000`;
	const ws = new WebSocket(wsURL, 'echo-protocol');

	return <WebSocketContext.Provider value={{ ws: ws, wsURL: wsURL }}>{props.children}</WebSocketContext.Provider>;
}

export const useWebSocketContext = () => React.useContext(WebSocketContext);
