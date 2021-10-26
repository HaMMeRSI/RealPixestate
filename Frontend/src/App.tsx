import { CSSProperties, useEffect, useRef, useState, MouseEvent } from "react";
import "./App.css";
import usePan from "./Canvas/usePan";
import useScale from "./Canvas/useScale";
import usePrevious from "./Hooks/usePrevious";
import MaskedArea from "./Canvas/MaskedArea";
import DescriptionBox from "./Canvas/DescriptionBox/DescriptionBox";
import DndComp from "./Canvas/DndComponent/DndComp";
import axios from "axios";
import { ImageT, Point } from "./typs";
import useBlcokchainData from "./Blockchain/useBlockchainData";

const pointUtils = {
	sum: (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y }),
	diff: (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y }),
	scale: (p1: Point, scale: number) => ({ x: p1.x * scale, y: p1.y * scale }),
	map: (p1: Point, fn: (x: number, y: number) => Point) => fn(p1.x, p1.y),
	eq: (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y,
};

const styles: { [key: string]: CSSProperties } = {
	canvasStyle: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	gridStyle: {
		pointerEvents: "none",
		position: "relative",
		width: "1000px",
		height: "1000px",
		backgroundSize: "5px 5px",
		backgroundImage: `
			linear-gradient(to right, grey .25px, transparent .25px),
			linear-gradient(to bottom, grey .25px, transparent .25px)`,
	},
	maskStyle: {
		position: "absolute",
		width: "1000px",
		height: "1000px",
		pointerEvents: "none",
		top: 0,
		left: 0,
	},
	blurStyle: { width: "100%", height: "100%", backgroundColor: "rgba(179, 179, 179, 0.23)", position: "absolute", top: 0, left: 0, filter: "blur(4px)", pointerEvents: "none" },
};

const realPixestateStyle = (offset: Point, scale: number): CSSProperties => ({
	position: "relative",
	transform: `translate(${-offset.x}px, ${-offset.y}px) scale(${scale}`,
	transformOrigin: `0 0`,
	display: "inline-block",
	width: "fit-content",
	boxShadow: "black 0 0 50px -20px",
});

const imageSrcs: Array<ImageT> = [
	// ["http://localhost:3000/testImages/1000x1000.png", 10, 10],
	["http://localhost:3000/testImages/50x50_1.png", 300, 300, 10, 10],
	["http://localhost:3000/testImages/50x50_1.png", 10, 10, 50, 50],
	["http://localhost:3000/testImages/50x50_2.png", 200, 200, 50, 50],
	["http://localhost:3000/testImages/50x50_3.png", 145, 50, 50, 50],
	["http://localhost:3000/testImages/50x50_4.png", 700, 825, 50, 50],
	["http://localhost:3000/testImages/50x100_1.png", 250, 50, 100, 50],
	["http://localhost:3000/testImages/100x50.png", 400, 50, 50, 100],
	["http://localhost:3000/testImages/200x200.png", 790, 790, 200, 200],
];

function setMousePos(pos: Point) {
	return (e: MouseEvent) => {
		pos.x = e.pageX;
		pos.y = e.pageY;
	};
}

function getTokenId([aleft, atop]: [number, number], [bright, bbottom]: [number, number], size = 1000) {
	return (atop * size + aleft) * size * size + bbottom * size + bright;
}

const parse5 = (n: number) => parseInt(`${n / 5}`) * 5;

let mousePosOnDown: Point = { x: 0, y: 0 };
let relativeMousePos: Point = { x: 0, y: 0 };
let adjustedOffset: Point = { x: 0, y: 0 };

const isDnd = { current: false };
const isScale = { current: false };

function App() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const realPixestateRef = useRef<HTMLDivElement>(null);
	const [offset, mousePos, startPan] = usePan(realPixestateRef);
	const scale = useScale(realPixestateRef);
	const [showMask, setShowMask] = useState(false);
	const [showOwner, setShowOwner] = useState(false);
	const [mask, setMaskPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
	const [tokensData, setTokensData] = useState<[number, string][]>([[-1, ""]]);
	const [cursor, setCursor] = useState("default");

	useBlcokchainData((tokenId, uri) => {
		setTokensData((tokens) => {
			return [...tokens, [tokenId, uri]];
		});
	});

	const realPixestateMouseMove = (e: MouseEvent) => {
		if (isDnd.current) {
			setCursor("grabbing");
		} else if (isScale.current) {
			setCursor("nw-resize");
		} else {
			setCursor("default");
		}

		if (isDnd.current) {
			dnd_drag_move(e);
		}
		if (isScale.current) {
			dnd_scale_move(e);
		}

		relativeMousePos.x = (e.pageX + adjustedOffset.x) / scale;
		relativeMousePos.y = (e.pageY + adjustedOffset.y) / scale;
	};

	function onAreaClick(_e: MouseEvent): any {
		if (pointUtils.eq(mousePos.current, mousePosOnDown)) {
			const { x: mx, y: my } = relativeMousePos;
			const imgs = imageSrcs.filter(([_src, x, y, w, h]) => mx >= x && mx <= x + w && my > y && my < y + h);
			const isDndCopy = isDnd.current;
			const isScaleCopy = isScale.current;

			setShowOwner(imgs.length > 0 && !showMask);
			setShowMask((mask) => {
				if (!mask) {
					if (imgs.length > 0) {
						setMaskPos({ x: imgs[0][1], y: imgs[0][2], w: imgs[0][3], h: imgs[0][4] });
					} else {
						setMaskPos({ ...pointUtils.map(relativeMousePos, (x, y) => ({ x: parseInt(`${x / 5}`) * 5, y: parseInt(`${y / 5}`) * 5 })), w: 4, h: 4 });
					}
				}

				return !mask || isDndCopy || isScaleCopy;
			});
		}
	}

	function dnd_drag_move(e: MouseEvent) {
		e.stopPropagation();
		const x = Math.max(0, Math.min(1000 - mask.w, parse5(relativeMousePos.x)));
		const y = Math.max(0, Math.min(1000 - mask.h, parse5(relativeMousePos.y)));
		setMaskPos((mask) => ({ x, y, w: mask.w, h: mask.h }));
	}

	function dnd_scale_move(e: MouseEvent) {
		e.stopPropagation();
		const w = Math.min(1000 - mask.x, Math.max(4, parse5(relativeMousePos.x) - mask.x + 4));
		const h = Math.min(1000 - mask.y, Math.max(4, parse5(relativeMousePos.y) - mask.y + 4));
		setMaskPos((mask) => ({ x: mask.x, y: mask.y, w: w >= 1000 ? 999 : w, h: h >= 1000 ? 999 : h }));
	}

	function containerMouseUp(_e: MouseEvent) {
		// setShowMask(false);
		setShowOwner(false);
		isDnd.current = false;
		isScale.current = false;
	}

	function realPixestateMouseUp(e: MouseEvent) {
		e.stopPropagation();
		onAreaClick(e);
		isDnd.current = false;
		isScale.current = false;
	}

	const lastOffset = usePrevious(offset) ?? offset;
	const lastScale = usePrevious(scale) ?? scale;
	if (lastScale === scale) {
		const delta = pointUtils.diff(offset, lastOffset);
		adjustedOffset = pointUtils.sum(adjustedOffset, delta);
	} else {
		const lastMouse = pointUtils.scale(relativeMousePos, lastScale);
		const newMouse = pointUtils.scale(relativeMousePos, scale);
		const mouseOffset = pointUtils.diff(lastMouse, newMouse);
		adjustedOffset = pointUtils.diff(adjustedOffset, mouseOffset);
	}

	useEffect(() => {
		function getTokenId([arow, acol]: any, [brow, bcol]: any, size = 1000) {
			return (arow * size + acol) * size * size + brow * size + bcol;
		}
		axios
			.post("https://us-central1-realpixestate-18a0e.cloudfunctions.net/helloWorld", {
				tokenId: getTokenId([0, 0], [9, 9]),
				description: "wefwef",
				external_url: "ewfwefwef",
				external_url_text: "wefwfewef",
				image: "https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300",
				name: "wefwefwefwef",
				name_bio: "wefwefwef",
			})
			.then((res) => console.log(res.data))
			.catch((e) => console.log(JSON.stringify(e)));
	}, []);

	useEffect(() => {
		const context = canvasRef.current?.getContext("2d");
		context?.fillRect(495, 495, 10, 10);
		// realPixestateRef?.current?.prepend(grid(200, 1000, { gridStyle, lineStyle }));
		imageSrcs.map(([src, x, y, w, h]) => {
			const image = new Image();
			image.src = src;

			image.onload = () => {
				context?.drawImage(image, x, y, w, h);
			};

			return image;
		});
	}, []);

	return (
		<div id="container" onMouseUp={containerMouseUp} style={{ cursor }} ref={containerRef}>
			<div
				id="realPixestate"
				ref={realPixestateRef}
				onMouseMove={realPixestateMouseMove}
				onMouseDown={startPan}
				onMouseUp={realPixestateMouseUp}
				style={realPixestateStyle(adjustedOffset, scale)}
			>
				<div style={styles.gridStyle}></div>
				<canvas onMouseDown={setMousePos(mousePosOnDown)} ref={canvasRef} width="1000" height="1000" style={styles.canvasStyle}></canvas>
				{!showOwner && showMask ? <DndComp parent={realPixestateRef} parentForPotal={containerRef} isDnd={isDnd} isScale={isScale} mask={mask} scale={scale}></DndComp> : <></>}
				{showMask ? <MaskedArea mask={mask} style={styles.maskStyle}></MaskedArea> : <></>}
				<div style={styles.blurStyle}></div>
				{showOwner ? <DescriptionBox scale={scale} tokenId={getTokenId([mask.x, mask.y], [mask.x + mask.w, mask.y + mask.h])}></DescriptionBox> : <></>}
			</div>
		</div>
	);
}

export default App;
