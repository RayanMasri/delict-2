import React, { useState, useRef, useEffect } from 'react';

const IconButton = (props) => {
	const [state, _setState] = useState({
		index: 0,
	});

	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	useEffect(() => {
		if (props.switchIndex != undefined) {
			setState({
				index: props.switchIndex,
			});
		}
	}, [props.switchIndex]);

	const onClick = () => {
		if (props.switch && props.switchable) {
			let index = _state.current.index;
			// console.log(index);
			if (index + 1 > props.children.length - 1) {
				index = 0;
			} else {
				index += 1;
			}
			// console.log(index);
			setState({
				index: index,
			});
		}
		// en
		// }
		console.log(props.children[_state.current.index]);
		if (props.onClick) props.onClick(props.children[_state.current.index].props.name);
	};

	return (
		<svg
			ref={props.ref}
			width={props.size}
			height={props.size}
			style={props.style}
			onClick={onClick}
			// onMouseEnter={onMouseEnter.bind(this)}
			// onMouseLeave={onMouseLeave.bind(this)}
			className={props.className}
		>
			<circle cx={props.size / 2} cy={props.size / 2} r={props.size / 2} fill={props.color}></circle>
			{(() => {
				if (props.switch) {
					// console.log(props.children[_state.current.index || 0].props.name); // here **
					return props.children[_state.current.index || 0];
				} else {
					return props.children;
				}
			})()}
		</svg>
	);
};

export default IconButton;
