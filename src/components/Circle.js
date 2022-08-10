import React from 'react';

const Circle = (props) => {
	return (
		<svg
			// viewBox={`-${props.childSize / 8} -${props.childSize / 8} 40.5 40.5`}
			// viewBox={`-${props.childSize / 8} -${props.childSize / 8} 40.5 40.5`}
			ref={props.ref}
			width={props.size}
			height={props.size}
			style={props.style}
			// style={{
			// ...props.style,
			// backgroundColor: 'blue',
			// }}
			onClick={props.onClick}
			// onMouseEnter={onMouseEnter.bind(this)}
			// onMouseLeave={onMouseLeave.bind(this)}
			className={props.className}
		>
			{/* <circle cx={props.size / 2 - props.childSize / 8} cy={props.size / 2 - props.childSize / 8} r={props.size / 2} fill={props.color}></circle> */}
			<circle cx={props.size / 2} cy={props.size / 2} r={props.size / 2} fill={props.color}></circle>
			{/* <circle r={props.size / 2} fill={props.color}></circle> */}
			{props.children}
		</svg>
	);
};

// class Circle extends React.Component {
// 	// onMouseEnter() {
// 	// 	let additive = 2;

// 	// 	let circle = this.svg.current.querySelector('circle');
// 	// 	this.svg.current.setAttribute('width', this.props.size + additive * 2);
// 	// 	this.svg.current.setAttribute('height', this.props.size + additive * 2);

// 	// 	circle.setAttribute('r', this.props.size / 2 + additive);
// 	// 	circle.setAttribute('cx', this.props.size / 2 + additive);
// 	// 	circle.setAttribute('cy', this.props.size / 2 + additive);
// 	// 	// circle.cx = '25';
// 	// 	console.log(circle);
// 	// }

// 	// onMouseLeave() {
// 	// 	let additive = 2;

// 	// 	let circle = this.svg.current.querySelector('circle');
// 	// 	this.svg.current.setAttribute('width', this.props.size);
// 	// 	this.svg.current.setAttribute('height', this.props.size);

// 	// 	circle.setAttribute('r', this.props.size / 2);
// 	// 	circle.setAttribute('cx', this.props.size / 2);
// 	// 	circle.setAttribute('cy', this.props.size / 2);
// 	// 	// circle.cx = '25';
// 	// 	console.log(circle);
// 	// }

// 	render() {
// 		return (
// 			<svg
// 				// ref={this.svg}
// 				width={this.props.size}
// 				height={this.props.size}
// 				style={this.props.style}
// 				onClick={this.props.onClick}
// 				// onMouseEnter={this.onMouseEnter.bind(this)}
// 				// onMouseLeave={this.onMouseLeave.bind(this)}
// 				className={this.props.className}
// 			>
// 				<circle cx={this.props.size / 2} cy={this.props.size / 2} r={this.props.size / 2} fill={this.props.color}></circle>
// 				{this.props.children}
// 			</svg>
// 		);
// 	}
// }

export default Circle;
