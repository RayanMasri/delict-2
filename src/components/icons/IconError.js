import React from 'react';

const IconError = (props) => {
	return (
		// <svg viewBox='0 0 64 64' fill={props.fill} fillOpacity={props.opacity} width={props.size} height={props.size} x={((props.parentSize || 0) - props.size) / 2} y={((props.parentSize || 0) - props.size) / 2}>
		<svg
			viewBox='0 0 64 64'
			fill={props.fill}
			fillOpacity={props.opacity}
			width={props.size}
			height={props.size}
			x={((props.parentSize || 0) - props.size) / 2}
			y={((props.parentSize || 0) - props.size) / 2}
		>
			<path d='M32,12.5A19.5,19.5,0,1,0,51.5,32,19.5,19.5,0,0,0,32,12.5Zm8.49,25.86a1.51,1.51,0,0,1-2.13,2.13L32,34.12l-6.36,6.37a1.51,1.51,0,0,1-2.13-2.13L29.88,32l-6.37-6.36a1.51,1.51,0,0,1,2.13-2.13L32,29.88l6.36-6.37a1.51,1.51,0,0,1,2.13,2.13L34.12,32Z' />
		</svg>
	);
};

export default IconError;
