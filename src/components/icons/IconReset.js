import React from 'react';

const IconReset = (props) => {
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
			<g>
				<path
					className='cls-1'
					d='M26.63,14.59c-6.72,4.93-6.27,4.58-6.27,4.88s-.18.17,6,5.18c5.69,4.57,5.56,4.48,5.86,4.29s.35-.34-.73-3.27c-.57-1.55-1.06-2.89-1.08-3-.06-.24,3.27-.08,4.38.2a12.62,12.62,0,1,1-13.89,6.18l.39-.68-.31-.2L16.6,25.38a2.49,2.49,0,0,0-.46.66A18.45,18.45,0,0,0,15.43,43a18.29,18.29,0,1,0,16.79-26,13.33,13.33,0,0,1-1.65-.14s.54-1.33,1.21-2.91c1.14-2.7,1.2-2.88,1.09-3.08-.3-.58-.18-.65-6.24,3.8'
				/>
			</g>
		</svg>
	);
};

export default IconReset;
