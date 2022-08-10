import React from 'react';

const IconTrash = (props) => {
	return (
		<svg
			viewBox='0 0 64 64'
			fill={props.fill}
			fillOpacity={props.opacity}
			width={props.size}
			height={props.size}
			x={((props.parentSize || 0) - props.size) / 2}
			y={((props.parentSize || 0) - props.size) / 2}
		>
			<path d='M26.28,11.9c-.32,1.2-.81,1.34-5,1.34H16.75V18.6h30.5V13.24H42.67c-4.14,0-4.63-.14-5-1.34S36.9,10.56,32,10.56,26.61,10.69,26.28,11.9Z' />
			<path d='M18.93,24.36c0,8.65,1.25,26.2,2,27.54.76,1.54,1,1.54,11.11,1.54s10.35,0,11.11-1.54c.71-1.34,2-18.89,2-27.54V21.28H18.93Z' />
		</svg>
	);
};

export default IconTrash;
