import React from 'react';

const IconWarn = (props) => {
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
			<path d='M44.75,34.6l-3-5.2L33.5,15.11c-.82-1.43-2.17-1.43-3,0L22.25,29.4l-3,5.2L11,48.89c-.82,1.43-.15,2.6,1.5,2.6h39c1.65,0,2.33-1.17,1.5-2.6ZM32,45a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,32,45Zm1.54-9.6A16,16,0,0,1,33.25,39c-.14.32-1,.58-1.23.58a2.77,2.77,0,0,1-.92-.26c-.32-.14-.58-2.25-.58-3.9V29.17a16.38,16.38,0,0,1,.26-3.59c.14-.32,1-.58,1.24-.58a3.07,3.07,0,0,1,.91.26c.32.15.59,2.26.59,3.91Z' />
		</svg>
	);
};

export default IconWarn;
