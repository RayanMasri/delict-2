import React, { useState, useEffect } from 'react';

// create a cotnext for textarea

const Textarea = (props) => {
	const [state, setState] = useState({
		name: props.id ? localStorage.getItem(props.id) || '' : '',
	});
	const input = React.useRef(null);

	const onChange = (event) => {
		// console.log(props.submit);

		setState({
			name: event.target.value,
		});
		if (props.id) {
			localStorage.setItem(props.id, event.target.value);
		}

		if (props.onChange) props.onChange(event);
	};

	const onBlur = (event) => {
		// 	// console.log(event.relatedTarget);
		// console.log(focusedElement);
		// console.log(document.activeElement);
		// 	// setTimeout(function () {
		// 	// 	console.log(focusedElement);
		// 	// }, 1000);
		// 	if (props.autofocus) input.current.focus();
	};

	const onKeyDown = (event) => {
		// console.log(event.keyCode == 13);
		// console.log(!event.shiftKey);
		// console.log(event.nativeEvent);
		if (props.submit && event.keyCode == 13 && !event.shiftKey) {
			props.onSubmit();
			return;
		}
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
				textAlign: 'left',
				fontSize: '14px',
				fontFamily: 'JannaLT',
				...props.style,
			}}
		>
			<textarea
				// type={props.type || 'text'}
				ref={input}
				onChange={onChange}
				onBlur={onBlur}
				onFocus={props.onFocus}
				onKeyDown={(event) => props.onKeyUp(event)}
				value={state.name}
				rows='10'
				cols='10'
				style={{
					...props.inputStyle,
					// width: props.inputWidth,
					// height: 27,
					backgroundColor: 'transparent',
					outline: 0,
					border: 0,
					textAlign: 'left',
					fontSize: '14px',
					fontFamily: 'JannaLT',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
				}}
				className={props.className}
			></textarea>
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

// class Textarea extends React.Component {
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

export default Textarea;
