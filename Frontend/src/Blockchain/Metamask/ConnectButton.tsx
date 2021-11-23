import { useCallback, useEffect, useState } from "react";
import { MetaMaskStatus } from "../../enums";
import { MetaMaskResponse } from "../../types";
import { addChainListener, addWalletListener, connectWallet, getCurrentWalletConnected } from "./Metamask";

type props = {
	onConnect: (address: string) => void;
};

export default function ConnectWalletButton({ onConnect }: props) {
	const [btnTextFirst, setText] = useState("Connect");
	const [status, setConnectionStatus] = useState(MetaMaskStatus.DC);

	const setStatus = useCallback(
		({ address, status, err }: MetaMaskResponse) => {
			setConnectionStatus(status);
			if (status === MetaMaskStatus.OK) {
				onConnect(address);
				setText(`${address.substring(0, 5)}...${address.substring(address.length - 4)}`);
			} else if (status === MetaMaskStatus.ERR) {
				setText(err);
			} else if (status === MetaMaskStatus.INSTALL) {
				setText("Install Metamask");
			} else if (status === MetaMaskStatus.DC) {
				setText("Connect");
			}
		},
		[onConnect]
	);

	const setChainId = useCallback(
		async (chainId: number) => {
			if (chainId === -1) {
				setText("Install Metamask");
			} else if (!(chainId === 1 || chainId === 3 || chainId === 1337) && !!chainId) {
				setText("Please switch to ethereum newtork");
			} else {
				setStatus(await getCurrentWalletConnected());
			}
		},
		[setStatus]
	);

	useEffect(() => {
		setChainId(parseInt(window.ethereum.chainId));
		const walletRemove = addWalletListener(setStatus);
		const chainRemove = addChainListener(setChainId);

		return () => {
			walletRemove?.();
			chainRemove?.();
		};
	}, [setChainId, setStatus]);

	const connectClicked = async () => {
		if (status !== MetaMaskStatus.OK) {
			setStatus(await connectWallet());
		}
	};

	return (
		<div className="connect_button modal__btn" onClick={connectClicked}>
			{btnTextFirst}
		</div>
	);
}
