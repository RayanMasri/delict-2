import React from 'react';

const IconPicker = (props) => {
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
			<path d='M38.82,25.63l-10.1-10.1L34.3,10l5.51,5.51,4.87-4.88c4.18-4.18,8.77.41,8.77.41Zm0,0L48.93,35.74l5.57-5.58L49,24.65l4.88-4.87c4.18-4.18-.42-8.78-.42-8.78ZM10.67,52.87l-2.29-2.3a39.65,39.65,0,0,1,8.39-13.9L31.4,22l5.05,5.05Zm0,0L13,55.16a39.49,39.49,0,0,0,13.9-8.39L41.5,32.14l-5-5.05Z' />
		</svg>
	);
};

export default IconPicker;
