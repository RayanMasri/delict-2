import React, { useState } from 'react';

let object = {
	name: localStorage.getItem('name') || 'Unnamed',
};

const NameContext = React.createContext({
	name: object,
	setName: (name) => {},
});

export function NameContextProvider(props) {
	const [name, setName] = useState(object);

	return <NameContext.Provider value={{ name, setName }}>{props.children}</NameContext.Provider>;
}

export const useNameContext = () => React.useContext(NameContext);
