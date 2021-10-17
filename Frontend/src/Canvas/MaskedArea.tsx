import { CSSProperties } from "react";

type Point = { x: number; y: number };
type Props = { startPos: Point; size: number; style: CSSProperties };

export default function MaskedArea({ startPos, size, style }: Props) {
	return (
		<svg viewBox="0 0 1000 1000" style={style}>
			<defs>
				<mask id="myMask">
					{/* Everything under a white pixel will be visible */}
					<rect x="0" y="0" width="1000" height="1000" fill="white" />

					{/* Everything under a black pixel will be invisible */}
					<rect x={startPos.x} y={startPos.y} width={size} height={size} fill="black" />
				</mask>
			</defs>
			<rect x={0} y={0} width={1000} height={1000} mask="url(#myMask)" style={{ fill: "hsl(231deg 38% 19% / 60%)" }} />
			<rect x={startPos.x} y={startPos.y} width={size} height={size} mask="url(#myMask)" fill="white" />
		</svg>
	);
}
