// import React, { useMemo } from "react";

import { CSSProperties } from "react";

type styles = {
	gridStyle?: CSSProperties;
	lineStyle?: CSSProperties;
};
// const gerArr = (size: number) => new Array(size).fill(0).map((_, i) => i);

const getStyleString = (style?: CSSProperties) => {
	if (!style) return "";

	return Object.entries(style)
		.flatMap((style) => style.join(":"))
		.join(";");
};

export default function createGrid(lines: number, dimensons: number, { gridStyle, lineStyle }: styles, base64: boolean = false): any {
	// create the svg element
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	svg.setAttribute("width", "1000");
	svg.setAttribute("height", "1000");
	svg.setAttribute("viewBox", "0 0 1000 1000");
	svg.setAttribute("style", getStyleString(gridStyle));

	const delta = Math.max(dimensons, lines) / Math.min(dimensons, lines);

	const createLine = (x1: number, y1: number, x2: number, y2: number) => {
		const line: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.setAttribute("x1", `${x1}`);
		line.setAttribute("y1", `${y1}`);
		line.setAttribute("x2", `${x2}`);
		line.setAttribute("y2", `${y2}`);
		line.setAttribute("style", getStyleString(lineStyle));

		return line;
	};

	for (let i = 0; i < lines; i++) {
		svg.appendChild(createLine(0, i * delta, dimensons, i * delta));
		svg.appendChild(createLine(i * delta, 0, i * delta, dimensons));
	}

	if (base64) {
		// get svg data
		var xml = new XMLSerializer().serializeToString(svg);
		console.log(xml);
		// make it base64
		var svg64 = btoa(xml);
		var b64Start = "data:image/svg+xml;base64,";

		// prepend a "header"
		return b64Start + svg64;
	}

	return svg;
}

// export default (gridSize: number, scale: number, offset: { x: number; y: number }, style: any = {}) => {
// 	const arr = useMemo(() => gerArr(gridSize), [gridSize]);
// 	const boxSizeSize = 1000;
// 	const delta = Math.max(boxSizeSize, gridSize) / Math.min(boxSizeSize, gridSize);

// 	return (
// 		<svg
// 			version="1.1"
// 			id="Layer_1"
// 			xmlns="http://www.w3.org/2000/svg"
// 			viewBox={`0 0 ${boxSizeSize} ${boxSizeSize}`}
// 			style={{ ...style, transform: `translate(${-offset.x}px,${-offset.y}px) scale(${scale})` }}
// 		>
// 			{arr.map((i) => (
// 				<React.Fragment key={i}>
// 					<line x1="0" y1={i * delta} x2={boxSizeSize} y2={i * delta} style={{ stroke: "rgb(255,0,0)", strokeWidth: 0.1 }} />
// 					<line x1={i * delta} y1="0" x2={i * delta} y2={boxSizeSize} style={{ stroke: "rgb(255,0,0)", strokeWidth: 0.1 }} />
// 				</React.Fragment>
// 			))}
// 		</svg>
// 	);
// };
