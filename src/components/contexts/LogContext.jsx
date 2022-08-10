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
};

const LogContext = React.createContext({
	log: object,
	setLog: (log) => {},
});

export function LogContextProvider(props) {
	const [log, setLog] = useState(object);
	return <LogContext.Provider value={{ log, setLog }}>{props.children}</LogContext.Provider>;
}

export const useLogContext = () => React.useContext(LogContext);
