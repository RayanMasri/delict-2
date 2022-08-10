import React from 'react';

const IconInfo = (props) => {
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
			<path d='M32,16.5A15.5,15.5,0,1,1,16.5,32,15.51,15.51,0,0,1,32,16.5m0-4A19.5,19.5,0,1,0,51.5,32,19.5,19.5,0,0,0,32,12.5Z' />
			<circle cx='31.98' cy='40.5' r='1.5' />
			<rect x='24.73' y='27.78' width='14.56' height='3' rx='1.17' transform='translate(2.73 61.3) rotate(-90)' />
		</svg>
	);
};

export default IconInfo;
