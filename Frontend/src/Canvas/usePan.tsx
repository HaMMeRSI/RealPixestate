import { MouseEvent as SyntheticMouseEvent, useCallback, useState } from "react";

type Point = { x: number; y: number };
const ORIGIN = Object.freeze({ x: 0, y: 0 });
const lastPointRef = { current: { x: 0, y: 0 } };

export default function usePan(): [Point, (e: SyntheticMouseEvent) => void] {
	const [panState, setPanState] = useState<Point>(ORIGIN);

	const pan = (e: MouseEvent) => {
		const lastPoint = lastPointRef.current;
		const point = { x: e.pageX, y: e.pageY };
		lastPointRef.current = point;

		setPanState((panState) => {
			return {
				x: panState.x + (lastPoint.x - point.x),
				y: panState.y + (lastPoint.y - point.y),
			};
		});
	};

	// Tear down listeners.
	const endPan = () => {
		document.removeEventListener("mousemove", pan);
		document.removeEventListener("mouseup", endPan);
	};

	// Set up listeners.
	const startPan = useCallback((e: SyntheticMouseEvent) => {
		document.addEventListener("mousemove", pan);
		document.addEventListener("mouseup", endPan);
		lastPointRef.current = { x: e.pageX, y: e.pageY };
	}, []);

	return [panState, startPan];
}
