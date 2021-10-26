export type Point = { x: number; y: number };
export type ImageT = [string, number, number, number, number];
export type Mask = { x: number; y: number; w: number; h: number };
export type Metadata = {
	tokenId: number;
	description: string;
	external_url: string;
	external_url_text: string;
	name: string;
	name_bio: string;
};
