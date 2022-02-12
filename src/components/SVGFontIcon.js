import React from 'react';

const SVGFontIcon = (props) => {
	return (
		<text
			x='50%'
			y='50%'
			dominantBaseline='middle'
			textAnchor='middle'
			style={{
				...props.style,
				fontFamily: 'icomoon',
				fill: props.color,
				fontSize: props.size,
			}}
			transform={props.transform || 'translate(0, 5)'}
		>
			{props.unicode}
		</text>
	);
};

export default SVGFontIcon;
