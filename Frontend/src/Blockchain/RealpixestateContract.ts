const Web3 = require("web3");
const rpeAbi = require("./abi/realPixestateABI.json");

var web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:9545"));
const rpeAddr = "0xc68FD93A5904Ed12386862eBe6E4a63ee44098f4";

const realPixestate = new web3.eth.Contract(rpeAbi, rpeAddr);

const testToken = "0x6a39e7A027063c62D5735AD2058892A87900C96F";

const address_ZERO = "0x0000000000000000000000000000000000000000";
const address_DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const address_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const address_USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";

export function getUsedTokens(): Promise<number[]> {
	return realPixestate.methods.getUsedTokenIds().call();
}

export function getTokenUri(tokenId: number): Promise<string> {
	return realPixestate.methods.tokenURI(tokenId).call();
}

export async function getPrices() {
	const promises = [
		realPixestate.methods.prices(address_ZERO).call(),
		realPixestate.methods.prices(address_DAI).call(),
		realPixestate.methods.prices(address_USDC).call(),
		realPixestate.methods.prices(address_USDT).call(),
		realPixestate.methods.prices(testToken).call(),
	];
	const prices = await Promise.all(promises);
	return {
		ETH: Web3.utils.fromWei(prices[0].toString(), "ether"),
		DAI: prices[1],
		USDC: prices[2],
		USDT: prices[3],
		TST: prices[1],
	};
}
