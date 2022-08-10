import React from 'react';

const IconText = (props) => {
	return (
		<svg
			viewBox='0 0 64 64'
			fill={props.fill}
			fillOpacity={props.opacity}
			width={props.size}
			height={props.size}
			x={((props.parentSize || 0) - props.size) / 2 + (props.xOffset || 0)}
			y={((props.parentSize || 0) - props.size) / 2 + (props.yOffset || 0)}
		>
			{/* <rect width='100%' height='100%' fill='yellow' fillOpacity='0.3'></rect> */}
			<path d='M32,13.21H48.46a2,2,0,0,1,2,2v6.55a2,2,0,0,1-2,2H47.28a2,2,0,0,1-2-2V20.39a2,2,0,0,0-2-2H36.54a2,2,0,0,0-2,2V43.61a2,2,0,0,0,2,2h1.18a2,2,0,0,1,2,2v1.18a2,2,0,0,1-2,2H32m.1,0H26.28a2,2,0,0,1-2-2V47.61a2,2,0,0,1,2-2h1.18a2,2,0,0,0,2-2V20.39a2,2,0,0,0-2-2H20.72a2,2,0,0,0-2,2v1.37a2,2,0,0,1-2,2H15.54a2,2,0,0,1-2-2V15.21a2,2,0,0,1,2-2H32.05' />
		</svg>
	);
};

export default IconText;
