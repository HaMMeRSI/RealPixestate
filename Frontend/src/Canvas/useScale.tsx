import { RefObject, useState } from "react";
import useEventListener from "../useEventListener";

const MIN_SCALE = 0.5;
const MAX_SCALE = 10;

function clamp(min: number, max: number, val: number) {
	if (val > max) return max;
	if (val < min) return min;
	return val;
}

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export default function useScale(ref: RefObject<HTMLElement | null>) {
	const [scale, setScale] = useState(1);

	useEventListener(ref, "wheel", (e: { preventDefault: () => void; deltaY: number }) => {
		e.preventDefault();
		const direction = e.deltaY > 0 ? -1 : 1;
		setScale((currentScale) => clamp(MIN_SCALE, MAX_SCALE, currentScale + 0.1 * direction));
	});

	return scale;
}