const Web3 = require("web3");
export const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:9545"));

export function getContract(abi: Object, address: string) {
	return new web3.eth.Contract(abi, address);
}

export function wei2eth(wei: string) {
	return Web3.utils.fromWei(wei, "ether");
}
