import { MouseEvent as SyntheticMouseEvent, RefObject, useState } from "react";

type Point = { x: number; y: number };
const ORIGIN = Object.freeze({ x: 0, y: 0 });
const lastPointRef: { current: Point } = { current: { x: 0, y: 0 } };

export default function usePan(ref: RefObject<HTMLElement | null>): [Point, { current: Point }, (e: SyntheticMouseEvent) => void] {
	const [panState, setPanState] = useState<Point>(ORIGIN);

	const pan = (e: MouseEvent) => {
		const lastPoint = lastPointRef.current;
		const point: Point = { x: e.pageX, y: e.pageY };
		lastPointRef.current = point;

		setPanState((panState) => {
			return {
				x: panState.x + (lastPoint.x - point.x),
				y: panState.y + (lastPoint.y - point.y),
			};
		});
	};

	// Tear down listeners.
	const endPan = (e: MouseEvent) => {
		ref.current?.removeEventListener("mousemove", pan);
		ref.current?.removeEventListener("mouseup", endPan);
	};

	// Set up listeners.
	const startPan = (e: SyntheticMouseEvent) => {
		ref.current?.addEventListener("mousemove", pan);
		ref.current?.addEventListener("mouseup", endPan);
		lastPointRef.current = { x: e.pageX, y: e.pageY };
	};

	return [panState, lastPointRef, startPan];
}
