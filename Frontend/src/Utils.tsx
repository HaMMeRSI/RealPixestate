import { UIEvent } from "react";
import { Mask } from "./typs";

export function stopPropagation(e: UIEvent) {
	e.stopPropagation();
}

export function maskToTokenId(mask: Mask, size = 1000) {
	console.log(mask);
	return (mask.y * size + mask.x) * size * size + (mask.y + mask.h) * size + (mask.x + mask.w);
}

export function breakTokenId(tokenId: number) {
	function Section(top: any, left: any, bottom: any, right: any) {
		return {
			x: parseInt(left),
			y: parseInt(top),
			w: parseInt(right) - parseInt(left) || 1000,
			h: parseInt(bottom) - parseInt(top) || 1000,
		};
	}

	const dimensions = 1000;
	const dimSquared = dimensions * dimensions;
	const tl = tokenId / dimSquared;
	const br = tokenId % dimSquared;

	const top = tl / dimensions;
	const left = tl % dimensions;

	const bottom = br / dimensions;
	const right = br % dimensions;

	return Section(top, left, bottom, right);
}
