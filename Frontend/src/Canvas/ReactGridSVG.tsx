import { CSSProperties } from "react";
type styles = {
	gridStyle?: CSSProperties;
	lineStyle?: CSSProperties;
};

type Props = {
	lines: number;
	dimensions: number;
	styles: styles;
	base64?: boolean;
};

export default function ReactGridSVG({ lines, dimensions, styles: { gridStyle, lineStyle } }: Props): any {
	const delta = Math.max(dimensions, lines) / Math.min(dimensions, lines);

	const createLines = () => {
		const lineElements = [];
		for (let i = 0; i < lines; i++) {
			lineElements.push(<line x1={0} y1={i * delta} x2={dimensions} y2={i * delta} style={lineStyle}></line>);
			lineElements.push(<line x1={i * delta} y1={0} x2={i * delta} y2={dimensions} style={lineStyle}></line>);
		}
		return lineElements;
	};

	return (
		<svg xmlns="http://www.w3.org/2000/svg" style={gridStyle} width={dimensions} height={dimensions} viewBox={`0 0 ${dimensions} ${dimensions}`}>
			{createLines()}
		</svg>
	);
}
