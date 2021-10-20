import { CSSProperties, MouseEvent as SyntheticMouseEvent, RefObject, useEffect } from "react";
import SvgImage from "../Images/MoveSvg";
import ScaleSvg from "../Images/ScaleSvg";
import useEventListener from "../useEventListener";

type Mask = { x: number; y: number; w: number; h: number };
type cRefObject<T> = { current: T };
type Props = {
	parent: RefObject<HTMLElement>;
	mask: Mask;
	isDnd: cRefObject<boolean>;
	isScale: cRefObject<boolean>;
	scale: number;
};

export default function DndComp({ mask, isDnd, isScale, scale }: Props) {
	const pos: CSSProperties = {
		top: mask.y,
		left: mask.x,
		width: mask.w,
		height: mask.h,
	};

	function dnd_drag_down(e: SyntheticMouseEvent) {
		e.stopPropagation();
		isDnd.current = true;
	}
	function dnd_scale_down(e: SyntheticMouseEvent) {
		e.stopPropagation();
		isScale.current = true;
	}
	function getScale(): CSSProperties {
		return {
			transform: `scale(${Math.max(1, (1 / scale) * 4)})`,
		};
	}

	return (
		<div className="dnd" style={pos}>
			<div className="dnd_move" onMouseDown={dnd_drag_down} style={getScale()}>
				<SvgImage></SvgImage>
			</div>
			<div className="dnd_scale" onMouseDown={dnd_scale_down} style={getScale()}>
				<ScaleSvg></ScaleSvg>
			</div>
		</div>
	);
}
