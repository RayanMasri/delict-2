import React, { useState, useEffect } from 'react';
import { useNameContext } from './contexts/NameContext.jsx';

export default function NameField(props) {
	const { name, setName } = useNameContext();

	const onChange = (event) => {
		props.onChange(event.target.value, () => {
			setName({
				name: event.target.value,
			});

			localStorage.setItem('name', event.target.value);
		});
	};

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
			}}
		>
			<input
				onChange={onChange.bind(this)}
				onFocus={props.onFocus}
				onKeyDown={props.onKeyDown}
				value={name.name}
				style={{
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
}
