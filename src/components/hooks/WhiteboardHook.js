import React from 'react';

// Websocket ready states
// 0: CONNECTING, Socket has been created. The connection is not yet open.
// 1: OPEN, The connection is open and ready to communicate.
// 2: CLOSING, The connection is in the process of closing.
// 3: CLOSED, The connection is closed or couldn't be opened.

export default function useWhiteboard() {
	const downloadCanvas = () => {
		let anchor = document.querySelector('.download-anchor');
		let canvas = document.querySelector('.main-canvas');

		anchor.href = canvas.toDataURL();
		anchor.click();
	};

	return {
		downloadCanvas,
	};
}
