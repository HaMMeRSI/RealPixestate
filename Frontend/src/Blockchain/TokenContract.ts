import { getContract, web3 } from "./Web3Helper";
import ERC20ABI from "./abi/ABI_ERC20.json";
import { address as rpeAddress } from "./RealpixestateContract";

export const tstTokenAddress = "0xF5aee13867C731b94088016B04e184B20A932108";

export const acceptedTokenAddresses: { [key: string]: string } = {
	TST: tstTokenAddress,
	ETH: "0x0000000000000000000000000000000000000000",
	ZERO: "0x0000000000000000000000000000000000000000",
	DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
	USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
};

export async function allowance(tokenAddress: string, address: string) {
	return await getContract(ERC20ABI, tokenAddress).methods.allowance(address, rpeAddress).call();
}

export async function approve(tokenAddress: string, amount = 999999999999) {
	const transactionParameters: any = {
		to: tokenAddress,
		from: window.ethereum.selectedAddress, // must match user's active address.
		data: getContract(ERC20ABI, tstTokenAddress).methods.approve(rpeAddress, amount).encodeABI(), //make call to NFT smart contract
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
