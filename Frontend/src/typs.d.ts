export type Point = { x: number; y: number };
export type ImageT = [string, number, number, number, number];
export type Mask = { x: number; y: number; w: number; h: number };
export type Metadata = {
	tokenId: number;
	image: string;
	description: string;
	external_url: string;
	external_url_text: string;
	name: string;
	name_bio: string;
};
export type TokenPrices = {
	ETH: number;
	DAI: number;
	USDC: number;
	USDT: number;
	TST: number;
	[key: string]: number;
};
type RealpixestateContext = {
	tokensData: [number, string][];
	reloadTokens: () => void;
	walletAccount: string;
};
export type MetaMaskResponse = {
	address: string;
	status: number;
	err?: any;
};

declare global {
	interface Window {
		ethereum: any;
	}
}
