import React, { useRef, useEffect } from 'react';
import * as paper from 'paper';

const PaperCanvas = () => {
	const canvasRef = useRef(null);
	const startCanvas = () => {
		paper.setup(canvasRef.current);
		makeDrawing();
	};

	const makeDrawing = () => {
		console.log(paper.project);
		let bg = new paper.Path.Rectangle(new paper.Size(512, 512), paper.project.view.bounds.topLeft);
		bg.name = 'something';

		bg.fillColor = 'red';
	};

	const deleteThing = () => {
		console.log('as');
		let children = paper.project.activeLayer.children;
		let index = children.findIndex((x) => x.name == 'something');
		if (index > -1) {
			console.log(children[index]);
			children[index].bounds.topLeft.set(paper.project.view.bounds.center);
			// children[index].bounds.center.set()
		}
	};

	useEffect(() => {
		// window.onmousedown = deleteThing;
		startCanvas();
	});

	return (
		<div>
			<canvas onClick={() => deleteThing()} ref={canvasRef} width='512' height='512'></canvas>
		</div>
	);
};

export default PaperCanvas;
