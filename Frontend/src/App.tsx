import { CSSProperties, useEffect, useRef, useState, MouseEvent } from "react";
import "./App.css";
import usePan from "./Canvas/usePan";
import useScale from "./Canvas/useScale";
import usePrevious from "./Canvas/usePrevious";
import MaskedArea from "./Canvas/MaskedArea";

const canvasStyle: any = {
	outline: "1px solid green",
	position: "absolute",
};

type Point = { x: number; y: number };

const pointUtils = {
	sum: (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y }),
	diff: (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y }),
	scale: (p1: Point, scale: number) => ({ x: p1.x * scale, y: p1.y * scale }),
	map: (p1: Point, fn: (x: number, y: number) => Point) => fn(p1.x, p1.y),
	eq: (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y,
};

const gridStyle: CSSProperties = {
	pointerEvents: "none",
	position: "absolute",
	width: "1000px",
	height: "1000px",
	backgroundSize: "5px 5px",
	backgroundImage: `
		linear-gradient(to right, grey .25px, transparent .25px),
		linear-gradient(to bottom, grey .25px, transparent .25px)`,
};

const maskStyle: CSSProperties = {
	position: "absolute",
	width: "1000px",
	height: "1000px",
	pointerEvents: "none",
};

const imageSrcs: Array<[string, number, number]> = [
	// ["http://localhost:3000/testImages/1000x1000.png", 10, 10],
	["http://localhost:3000/testImages/50x50_1.png", 10, 10],
	["http://localhost:3000/testImages/50x50_2.png", 200, 200],
	["http://localhost:3000/testImages/50x50_3.png", 145, 50],
	["http://localhost:3000/testImages/50x50_4.png", 700, 825],
	["http://localhost:3000/testImages/50x100_1.png", 250, 50],
	["http://localhost:3000/testImages/100x50.png", 400, 50],
	["http://localhost:3000/testImages/200x200.png", 790, 790],
];

const getTransform = (offset: Point, scale: number): CSSProperties => ({
	position: "relative",
	transform: `translate(${-offset.x}px, ${-offset.y}px) scale(${scale}`,
	transformOrigin: `0 0`,
});

let mousePosOnDown: Point = { x: 0, y: 0 };
let mousePos: Point = { x: 0, y: 0 };
let adjustedOffset: Point = { x: 0, y: 0 };

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const realPixestateRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [offset, startPan] = usePan();
	const scale = useScale(containerRef);
	const [showMask, setShowMask] = useState(false);
	const [maskPos, setMaskPos] = useState({ x: 0, y: 0 });

	function setMousePos(pos: Point) {
		return (e: MouseEvent) => {
			pos.x = (e.pageX + adjustedOffset.x) / scale;
			pos.y = (e.pageY + adjustedOffset.y) / scale;
		};
	}

	const lastOffset = usePrevious(offset) ?? offset;
	const lastScale = usePrevious(scale) ?? scale;

	function openMask(_e: MouseEvent) {
		if (pointUtils.eq(mousePos, mousePosOnDown)) {
			setShowMask((mask) => {
				if (!mask) {
					setMaskPos(pointUtils.map(mousePos, (x, y) => ({ x: parseInt(`${x / 5}`) * 5, y: parseInt(`${y / 5}`) * 5 })));
				}

				return !mask;
			});
		}
	}

	if (lastScale === scale) {
		const delta = pointUtils.diff(offset, lastOffset);
		adjustedOffset = pointUtils.sum(adjustedOffset, delta);
	} else {
		const lastMouse = pointUtils.scale(mousePos, lastScale);
		const newMouse = pointUtils.scale(mousePos, scale);
		const mouseOffset = pointUtils.diff(lastMouse, newMouse);
		adjustedOffset = pointUtils.diff(adjustedOffset, mouseOffset);
	}

	useEffect(() => {
		const context = canvasRef.current?.getContext("2d");
		context?.fillRect(495, 495, 10, 10);
		// realPixestateRef?.current?.prepend(grid(200, 1000, { gridStyle, lineStyle }));
		imageSrcs.map(([src, x, y]) => {
			const image = new Image();
			image.src = src;

			image.onload = () => {
				context?.drawImage(image, x, y);
			};

			return image;
		});
	}, []);

	return (
		<div id="container" ref={containerRef} onMouseDown={startPan}>
			<div id="realPixestate" ref={realPixestateRef} onMouseMove={setMousePos(mousePos)} style={getTransform(adjustedOffset, scale)}>
				<div style={gridStyle}></div>
				<canvas onMouseDown={setMousePos(mousePosOnDown)} onMouseUp={openMask} ref={canvasRef} width="1000" height="1000" style={canvasStyle}></canvas>
				{showMask ? <MaskedArea startPos={maskPos} size={50} style={maskStyle}></MaskedArea> : <></>}
			</div>
		</div>
	);
}

export default App;
