import React from 'react';

const IconGrid = (props) => {
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
			<rect x='12.58' y='9.78' width='3.61' height='44.44' rx='1.81' />
			<rect x='35.11' y='9.78' width='3.61' height='44.44' rx='1.81' />
			<rect x='23.84' y='9.78' width='3.61' height='44.44' rx='1.81' />
			<rect x='46.37' y='9.78' width='3.61' height='44.44' rx='1.81' />
			<rect x='30.19' y='26.68' width='3.61' height='44.44' rx='1.81' transform='translate(-16.9 80.9) rotate(-90)' />
			<rect x='30.19' y='4.15' width='3.61' height='44.44' rx='1.81' transform='translate(5.63 58.37) rotate(-90)' />
			<rect x='30.19' y='15.41' width='3.61' height='44.44' rx='1.81' transform='translate(-5.63 69.63) rotate(-90)' />
			<rect x='30.19' y='-7.12' width='3.61' height='44.44' rx='1.81' transform='translate(16.9 47.1) rotate(-90)' />
		</svg>
	);
};

export default IconGrid;
