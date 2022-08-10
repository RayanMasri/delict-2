import React from 'react';

const IconPencil = (props) => {
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
			<polygon points='30.92 20.47 11.41 39.97 9.14 55.12 23.68 52.94 43.53 33.08 30.92 20.47' />
			<path d='M33.35,18,41,10.37,53.38,22.73l-7.67,7.66ZM47.2,16.55,50,13.76,45.86,9.64c-2.06-2.06-4.84.73-4.84.73Zm0,0L50,13.76l4.12,4.12c2.06,2.06-.72,4.85-.72,4.85Z' />
		</svg>
	);
};

export default IconPencil;
