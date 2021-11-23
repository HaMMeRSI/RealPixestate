import { getContract } from "./Web3Helper";
import ERC20ABI from "./abi/ABI_ERC20.json";
import addresses from "./addresses";

export const acceptedTokenAddresses: { [key: string]: string } = {
	TST: addresses.myToken,
	ETH: addresses.ETH,
	ZERO: addresses.ZERO,
	DAI: addresses.DAI,
	USDC: addresses.USDC,
	USDT: addresses.USDT,
};

export async function allowance(tokenAddress: string, address: string) {
	return await getContract(ERC20ABI, tokenAddress).methods.allowance(address, addresses.realPixestate).call();
}

export async function approve(tokenAddress: string, amount = 999999999999) {
	const transactionParameters: any = {
		to: tokenAddress,
		from: window.ethereum.selectedAddress, // must match user's active address.
		data: getContract(ERC20ABI, addresses.myToken).methods.approve(addresses.realPixestate, amount).encodeABI(), //make call to NFT smart contract
	};

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
	// return getContract(ERC20ABI, address).methods.approve(rpeAddress, 9999).send({ from: address });
}
