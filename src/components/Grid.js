import React from 'react';

const Grid = (props) => {
	const comparisons = {
		row: 'marginRight',
		'row-reverse': 'marginLeft',
		column: 'marginBottom',
		'column-reverse': 'marginTop',
	};

	const split = (array, n) => {
		let [...arr] = array;
		var res = [];
		while (arr.length) {
			res.push(arr.splice(0, n));
		}
		return res;
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: props.direction || 'row',
				justifyContent: 'center',
				alignItems: 'center',
				...props.style,
			}}
		>
			{split(props.children, props.height).map((group, index) => {
				let style = {
					display: 'flex',
					flexDirection: props.groupDirection || 'column',
				};

				if (index < Math.ceil(props.children.length / props.height) - 1) {
					style[comparisons[props.direction || 'row']] = props.spacing;
				}

				return (
					<div style={style} key={`key-${index}`}>
						{group.map((child, index) => {
							if (index >= group.length - 1) return child;
							if (React.isValidElement(child)) {
								let style = child.props.style || {};

								style[comparisons[props.groupDirection || 'column']] = props.spacing;

								return React.cloneElement(child, { style: style });
							}
							return child;
						})}
					</div>
				);
			})}
		</div>
	);
};

// class Grid extends React.Component {
// 	constructor() {
// 		super();

// 		this.comparisons = {
// 			row: 'marginRight',
// 			'row-reverse': 'marginLeft',
// 			column: 'marginBottom',
// 			'column-reverse': 'marginTop',
// 		};
// 	}

// 	split(array, n) {
// 		let [...arr] = array;
// 		var res = [];
// 		while (arr.length) {
// 			res.push(arr.splice(0, n));
// 		}
// 		return res;
// 	}

// 	render() {
// 		return (
// 			<div
// 				style={{
// 					display: 'flex',
// 					flexDirection: this.props.direction || 'row',
// 					justifyContent: 'center',
// 					alignItems: 'center',
// 					...this.props.style,
// 				}}
// 			>
// 				{this.split(this.props.children, this.props.height).map((group, index) => {
// 					let style = {
// 						display: 'flex',
// 						flexDirection: this.props.groupDirection || 'column',
// 					};

// 					if (index < Math.ceil(this.props.children.length / this.props.height) - 1) {
// 						style[this.comparisons[this.props.direction || 'row']] = this.props.spacing;
// 					}

// 					return (
// 						<div style={style} key={`key-${index}`}>
// 							{group.map((child, index) => {
// 								if (index >= group.length - 1) return child;
// 								if (React.isValidElement(child)) {
// 									let style = child.props.style || {};

// 									style[this.comparisons[this.props.groupDirection || 'column']] = this.props.spacing;

// 									return React.cloneElement(child, { style: style });
// 								}
// 								return child;
// 							})}
// 						</div>
// 					);
// 				})}
// 			</div>
// 		);
// 	}
// }

export default Grid;
