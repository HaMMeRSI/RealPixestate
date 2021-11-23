import Web3 from "web3";
import { TokenPrices } from "../types";
import { breakTokenId } from "../Utils";
import { acceptedTokenAddresses } from "./TokenContract";
import { getContract, wei2eth } from "./Web3Helper";
import addresses from './addresses';

const realPixestate = getContract(require("./abi/ABI_realPixestate.json"), addresses.realPixestate);

export function getUsedTokens(): Promise<number[]> {
	return realPixestate.methods.getUsedTokenIds().call();
}

export function ownerOf(tokenId: number): Promise<string> {
	return realPixestate.methods.ownerOf(tokenId).call();
}

export function getTokenUri(tokenId: number): Promise<string> {
	return realPixestate.methods.tokenURI(tokenId).call();
}

export function areaIsOccupied(tokenId: number): Promise<boolean> {
	return realPixestate.methods.areaIsOccupied(tokenId).call();
}

export async function getPrices(): Promise<TokenPrices> {
	const promises = [
		realPixestate.methods.prices(acceptedTokenAddresses.ETH).call(),
		realPixestate.methods.prices(acceptedTokenAddresses.DAI).call(),
		realPixestate.methods.prices(acceptedTokenAddresses.USDC).call(),
		realPixestate.methods.prices(acceptedTokenAddresses.USDT).call(),
		realPixestate.methods.prices(acceptedTokenAddresses.TST).call(),
	];

	const prices: number[] = await Promise.all<number>(promises);

	return {
		TST: prices[4],
		ETH: wei2eth(prices[0].toString()),
		DAI: prices[1],
		USDC: prices[2],
		USDT: prices[3],
	};
}

export async function safeMint(tokenId: number, currency: string, uri: string) {
	//set up your Ethereum transaction
	const transactionParameters: any = {
		to: addresses.realPixestate,
		from: window.ethereum.selectedAddress, // must match user's active address.
		data: realPixestate.methods.safeMint(window.ethereum.selectedAddress, tokenId, acceptedTokenAddresses[currency], uri).encodeABI(), //make call to NFT smart contract
	};

	const price = (await getPrices())[currency];

	if (currency === "ETH") {
		const mask = breakTokenId(tokenId);
		const area = (mask.w + 1) * (mask.h + 1);
		transactionParameters.value = Web3.utils.toHex(Web3.utils.toWei((area * price).toString(), "ether"));
		console.log(transactionParameters.value);
	}

	//sign the transaction via Metamask
	try {
		const txHash = await window.ethereum.request({
			method: "eth_sendTransaction",
			params: [transactionParameters],
		});
		return {
			success: true,
			status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash,
		};
	} catch (error: any) {
		return {
			success: false,
			status: "😥 Something went wrong: " + error.message,
		};
	}
}
