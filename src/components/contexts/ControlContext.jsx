import React, { useState } from 'react';

let object = {
	log: {
		content: '',
		level: 'info',
		levelColor: 'white',
		active: false,
		permanent: false,
		timeout: undefined,
	},
	canCreateLog: true,
	nextLog: undefined,
	color: '#000000',
	tool: 'pencil',
	latestAction: 'init',
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
};

const ControlContext = React.createContext({
	control: object,
	setControl: (control) => {},
});

export function ControlContextProvider(props) {
	const [control, setControl] = useState(object);

	// const setControl = (_control) => {
	// 	let diff = Object.keys(_control).reduce((diff, key) => {
	// 		if (control[key] === _control[key]) return diff;
	// 		return {
	// 			...diff,
	// 			[key]: _control[key],
	// 		};
	// 	}, {});
	// 	console.error('CONTEXT: Set control');
	// 	console.error(diff);
	// 	console.error(`CONTEXT: Changed tool from ${control.tool} to ${_control.tool}`);
	// 	_setControl(_control);
	// };

	return <ControlContext.Provider value={{ control, setControl }}>{props.children}</ControlContext.Provider>;
}

export const useControlContext = () => React.useContext(ControlContext);
