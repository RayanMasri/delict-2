import React from 'react';

const IconPin = (props) => {
	return (
		<svg
			viewBox='0 0 32 64'
			fill={props.fill}
			fillOpacity={props.opacity}
			width={props.width}
			height={props.height}
			x={props.x || ((props.parentSize || 0) - props.width) / 2}
			y={props.y || ((props.parentSize || 0) - props.height) / 2}
		>
			<path
				// x={props.childX}
				// y={props.childY}
				transform={`translate(${props.childX}, ${props.childY})`}
				d='M32,12.88h6.45S40.36,14.5,37,16.7L37.87,29a3.92,3.92,0,0,1,3.66,4.25l-.44.44-7.55,0v7.46s-.22,7.92-.66,9.24c0,0-.26.69-.88.69m0-38.24H25.55S23.64,14.5,27,16.7L26.13,29a3.92,3.92,0,0,0-3.66,4.25l.44.44,7.55,0v7.46s.22,7.92.66,9.24c0,0,.26.69.88.69'
			/>
		</svg>
	);
};

export default IconPin;
