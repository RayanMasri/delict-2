import React from 'react';

const IconTrash = (props) => {
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
			<defs>
				<style>{`.cls-1{fill-rule:evenodd;}`}</style>
			</defs>
			<path
				className='cls-1'
				d='M28.59,11.3a2.26,2.26,0,0,0-.94.64c-.75.78-.74,4.31-.74,11v5.86h-3c-3.61,0-3.93.12-4,1.48,0,.7-.1.58,5.6,6.55,5.9,6.18,5.62,5.92,6.36,5.92s.48.24,6.27-5.81,5.67-5.91,5.67-6.64c0-1.39-.29-1.5-3.94-1.5H37V23c0-6.77,0-10.26-.78-11.06s-.94-.78-4.3-.78c-2.5,0-2.86,0-3.32.18M32,44.93l15.59.14s4.28,4.1,0,7.81H32Zm0,0-15.59.14s-4.28,4.1,0,7.81H32Z'
			/>
		</svg>
	);
};

export default IconTrash;
