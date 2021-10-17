import { useEffect, useRef } from "react";
import useScale from "./Canvas/useScale";

export default function () {
	const containerRef = useRef<HTMLDivElement>(null);
	const scale = useScale(containerRef);

	const lastScale = useRef(scale);
	useEffect(() => {
		lastScale.current = scale;
	}, [scale]);

	return (
		<div id="container" ref={containerRef}>
			{lastScale.current + " " + scale}
		</div>
	);
}
