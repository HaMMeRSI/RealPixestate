import { CSSProperties } from "react";

type Mask = { x: number; y: number; w: number; h: number };
type Props = { mask: Mask; style: CSSProperties };

export default function MaskedArea({ mask, style }: Props) {
	const bw = 2;
	return (
		<svg viewBox="0 0 1000 1000" style={style}>
			<defs>
				<mask id="myMask">
					{/* Everything under a white pixel will be visible */}
					<rect x="0" y="0" width="1000" height="1000" fill="white" />

					{/* Everything under a black pixel will be invisible */}
					<rect x={mask.x} y={mask.y} width={mask.w} height={mask.h} fill="black" />
				</mask>
			</defs>
			<rect x={0} y={0} width={1000} height={1000} mask="url(#myMask)" style={{ fill: "hsl(231deg 38% 19% / 60%)", filter: "blur(5px)" }} />
			<rect x={mask.x} y={mask.y} width={mask.w} height={mask.h} mask="url(#myMask)" fill="white" />
			<rect x={mask.x - bw / 2} y={mask.y - bw / 2} width={mask.w + bw} height={mask.h + bw} mask="url(#myMask)" fill="rgb(10 2 255 / 54%)" rx="1" />
		</svg>
	);
}
