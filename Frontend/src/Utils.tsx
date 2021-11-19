import { UIEvent } from "react";
import { Mask } from "./typs";

export function stopPropagation(e: UIEvent) {
	e.stopPropagation();
}

export function maskToTokenId(mask: Mask, size = 1000) {
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

export function checkIntersection(tokenId: number, tokenIds: number[]) {
	for (const currTokenId of tokenIds) {
		const area1 = breakTokenId(tokenId);
		const area2 = breakTokenId(currTokenId);
		if (!(area2.x > area1.x + area1.w || area2.x + area2.w < area1.x || area2.y > area1.y + area1.h || area2.y + area2.h < area1.y)) {
			return true;
		}
	}

	return false;
}

export async function getImageSize(src: string): Promise<number> {
	try {
		const fetchedData = await fetch(src);
		const blob = await fetchedData.blob();
		return blob.size;
	} catch (e) {
		return -1;
	}
}
