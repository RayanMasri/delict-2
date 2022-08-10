import React from 'react';

const IconZoomOut = (props) => {
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
			<rect x='40.81' y='34.78' width='6.45' height='18.04' rx='3.23' transform='translate(-18.07 43.97) rotate(-45)' />
			<path d='M28.52,12.88A15.89,15.89,0,1,0,44.41,28.77,15.88,15.88,0,0,0,28.52,12.88Zm0,27.89a12,12,0,1,1,12-12A12,12,0,0,1,28.52,40.77Z' />
			<rect x='27.03' y='20.58' width='2.98' height='16.38' rx='1.49' transform='translate(-0.25 57.29) rotate(-90)' />
		</svg>
	);
};

export default IconZoomOut;
