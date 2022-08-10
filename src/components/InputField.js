import React, { useState, useEffect } from 'react';

const useActiveElement = () => {
	const [active, setActive] = useState(document.activeElement);

	const handleFocusIn = (e) => {
		setActive(document.activeElement);
	};

	useEffect(() => {
		document.addEventListener('focusin', handleFocusIn);
		return () => {
			document.removeEventListener('focusin', handleFocusIn);
		};
	}, []);

	return active;
};

const InputField = (props) => {
	const [state, setState] = useState({
		name: props.id ? localStorage.getItem(props.id) || '' : '',
	});
	const focusedElement = useActiveElement();

	const input = React.useRef(null);

	const onChange = (event) => {
		setState({
			name: event.target.value,
		});
		if (props.id) {
			localStorage.setItem(props.id, event.target.value);
		}

		const refuse = (alternative) => {
			setState({
				name: alternative,
			});
			if (props.id) {
				localStorage.setItem(props.id, alternative);
			}
		};

		if (props.onChange) props.onChange(event, refuse);
	};

	const onBlur = (event) => {
		// 	// console.log(event.relatedTarget);
		// 	// console.log(focusedElement.value);
		// 	// setTimeout(function () {
		// 	// 	console.log(focusedElement);
		// 	// }, 1000);
		// 	if (props.autofocus) input.current.focus();
	};

	const set = (value) => {
		setState({
			name: value,
		});
	};

	useEffect(() => {
		if (props._ref) {
			props._ref.current = {
				input: input.current,
				set: set,
			};
		}
	}, []);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				textAlign: 'center',
				fontSize: '14px',
				fontFamily: 'JannaLT',
				...props.style,
			}}
		>
			{/* make it so that autofocus is disabled when changing name */}
			<input
				type={props.type || 'text'}
				ref={input}
				onChange={onChange.bind(this)}
				onBlur={onBlur.bind(this)}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				// onKeyUp={(event) => props.onKeyUp(event, state.name)}
				value={state.name}
				style={{
					...props.inputStyle,
					width: props.inputWidth,
					height: 27,
					backgroundColor: 'transparent',
					outline: 0,
					border: 0,
					textAlign: 'center',
					fontSize: '14px',
					fontFamily: 'JannaLT',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
				}}
				autoFocus={props.autofocus || false}
			></input>
			{props.underline ? (
				<div
					style={{
						backgroundColor: 'black',
						...props.underlineStyle,
					}}
				>
					&nbsp;
				</div>
			) : undefined}
		</div>
	);
};

// class InputField extends React.Component {
// 	constructor() {
// 		super();
// 		this.state = {
// 			name: localStorage.getItem('name') || 'Unknown',
// 		};
// 	}

// 	onChange(event) {
// 		this.setState({
// 			name: event.target.value,
// 		});
// 		localStorage.setItem('name', event.target.value);
// 		this.props.onNameChange(event.target.value);
// 	}

// 	render() {
// 		return (
// 			<div
// 				style={{
// 					display: 'flex',
// 					justifyContent: 'center',
// 					alignItems: 'center',
// 					flexDirection: 'column',
// 					textAlign: 'center',
// 					fontSize: '14px',
// 					fontFamily: 'JannaLT',
// 				}}
// 			>
// 				<input
// 					type='text'
// 					onChange={this.onChange.bind(this)}
// 					value={this.state.name}
// 					style={{
// 						width: this.props.inputWidth,
// 						height: 27,
// 						backgroundColor: 'transparent',
// 						outline: 0,
// 						border: 0,
// 						textAlign: 'center',
// 						fontSize: '14px',
// 						fontFamily: 'JannaLT',
// 						textOverflow: 'ellipsis',
// 						whiteSpace: 'nowrap',
// 						overflow: 'hidden',
// 					}}
// 				></input>
// 				<div
// 					style={{
// 						backgroundColor: 'black',
// 						...this.props.style,
// 					}}
// 				>
// 					&nbsp;
// 				</div>
// 			</div>
// 		);
// 	}
// }

export default InputField;
