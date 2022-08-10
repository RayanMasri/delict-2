import React from 'react';

const IconEraser = (props) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 64 64'
			fill={props.fill}
			fillOpacity={props.opacity}
			width={props.size}
			height={props.size}
			x={((props.parentSize || 0) - props.size) / 2}
			y={((props.parentSize || 0) - props.size) / 2}
		>
			{/* <path d='M8,2V1H3v1h1v3.8L3,7h2v2.5L5.5,10L6,9.5V7h2L7,5.8V2H8z M6,6H5V2h1V6z' /> */}
			<path d='M52.36,19.83l-8.2-8.19a8,8,0,0,0-11.31,0L11.64,32.85a8,8,0,0,0,0,11.32l8.2,8.19a8,8,0,0,0,11.31,0L52.36,31.15A8,8,0,0,0,52.36,19.83ZM26.54,47.91,16.09,37.46,27.93,25.62,38.38,36.07Z' />
		</svg>
	);
};

export default IconEraser;
