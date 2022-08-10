import React from 'react';

const IconCopy = (props) => {
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
			<rect x='17.88' y='19.02' width='22.33' height='32.63' rx='3.2' transform='translate(-0.5 0.42) rotate(-0.82)' />
			<path d='M42.69,12.24l-15.93.23a3.18,3.18,0,0,0-3.15,3.24v.52L39,16a3.19,3.19,0,0,1,3.24,3.15l.37,25.71h.53a3.19,3.19,0,0,0,3.15-3.24l-.38-26.23A3.19,3.19,0,0,0,42.69,12.24Z' />
		</svg>
	);
};

export default IconCopy;
