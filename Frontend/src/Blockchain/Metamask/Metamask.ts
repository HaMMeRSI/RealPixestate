import { MetaMaskResponse } from "../../types";

export const connectWallet = async (): Promise<MetaMaskResponse> => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({ method: "eth_requestAccounts" });
			const obj = { status: 0, address: addressArray[0] };
			return obj;
		} catch (err) {
			return { address: "", status: 1, err };
		}
	} else {
		return {
			address: "",
			status: 2,
		};
	}
};

export const getCurrentWalletConnected = async (): Promise<MetaMaskResponse> => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({ method: "eth_accounts" });
			if (addressArray.length > 0) {
				return { address: addressArray[0], status: 0 };
			} else {
				return { address: "", status: -1, err: "No addresses fetched" };
			}
		} catch (err) {
			return { address: "", status: 1, err };
		}
	} else {
		return {
			address: "",
			status: 2,
		};
	}
};

export const SignTransactionMM = async (): Promise<MetaMaskResponse> => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({ method: "signTypedData_v4 " });
			if (addressArray.length > 0) {
				return { address: addressArray[0], status: 0 };
			} else {
				return { address: "", status: -1 };
			}
		} catch (err) {
			return { address: "", status: 1, err };
		}
	} else {
		return {
			address: "",
			status: 2,
		};
	}
};

export function addWalletListener(onAccountsChanged: (response: MetaMaskResponse) => void) {
	if (window.ethereum) {
		const func = (accounts: string[]) => {
			if (accounts.length > 0) {
				onAccountsChanged({ address: accounts[0], status: 0 });
			} else {
				console.log(accounts);
				onAccountsChanged({ address: "", status: -1 });
			}
		};
		window.ethereum.on("accountsChanged", func);

		return () => window.ethereum.removeListener("accountsChanged", func);
	} else {
		onAccountsChanged({ address: "", status: 2 });
	}
}

export function addChainListener(onChainChanged: (response: number) => void) {
	if (window.ethereum) {
		const func = (chainId: string) => {
			console.log(parseInt(chainId));
			onChainChanged(parseInt(chainId));
		};

		window.ethereum.on("chainChanged", func);
		return () => window.ethereum.removeListener("chainChanged", func);
	} else {
		onChainChanged(-1);
	}
}
