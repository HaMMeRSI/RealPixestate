import { UIEvent } from "react";
import { Section } from "./types";

export function stopPropagation(e: UIEvent) {
	e.stopPropagation();
}

export function maskToTokenId(mask: Section, size = 1000) {
	return (mask.x * size + mask.y) * size * size + (mask.x + mask.w) * size + (mask.y + mask.h);
}

export function breakTokenId(tokenId: number): Section {
	function Section(x1: any, y1: any, x2: any, y2: any): Section {
		return {
			x: parseInt(x1),
			y: parseInt(y1),
			w: parseInt(x2) - parseInt(x1) || 1000,
			h: parseInt(y2) - parseInt(y1) || 1000,
		};
	}

	const dimensions = 1000;
	const dimSquared = dimensions * dimensions;
	const xy1 = tokenId / dimSquared;
	const xy2 = tokenId % dimSquared;

	const x1 = xy1 / dimensions;
	const y1 = xy1 % dimensions;

	const x2 = xy2 / dimensions;
	const y2 = xy2 % dimensions;

	return Section(x1, y1, x2, y2);
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
