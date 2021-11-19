import { useEffect, useState } from "react";
import { MetaMaskResponse } from "../../typs";
import { addChainListener, addWalletListener, connectWallet, getCurrentWalletConnected } from "./Metamask";

type props = {
	onConnect: (address: string) => void;
};

function splitTest(text: String) {
	return [text.substring(0, text.length - 6), text.substring(text.length - 6)];
}

export default function ConnectWalletButton({ onConnect }: props) {
	const [btnTextFirst, setBtnTextFirst] = useState("Connect");
	const [btnTextSecond, setBtnTextSecond] = useState("");
	const [status, setConnectionStatus] = useState(-1);

	const setText = (first: string, second = "") => {
		setBtnTextFirst(first);
		setBtnTextSecond(second);
	};

	const setStatus = ({ address, status, err }: MetaMaskResponse) => {
		setConnectionStatus(status);
		if (status === 0) {
			onConnect(address);
			setText.apply(null, splitTest(address) as any);
		} else if (status === 1) {
			setText(err);
		} else if (status === 2) {
			setText("Install Metamask");
		} else if (status === -1) {
			setText("Connect");
		}
	};

	useEffect(() => {
		getCurrentWalletConnected().then((response: MetaMaskResponse) => {
			setStatus(response);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connectClicked = async () => {
		if (status !== 0) {
			const response = await connectWallet();
			if (response.status === 0) {
				onConnect(response.address);
				setText.apply(null, splitTest(response.address) as any);
			} else if (response.status === 1) {
				setText("Error with connecting to metamask");
			} else if (response.status === 2) {
				setText("Install Metamask");
			}
		}
	};

	const setChainStatus = (chainId: number) => {
		if (chainId === -1) {
			setText("Install Metamask");
		} else if (!(chainId === 1 || chainId === 3)) {
			setText("Please switch to ethereum newtork");
		} else {
			getCurrentWalletConnected().then((response: MetaMaskResponse) => {
				setStatus(response);
			});
		}
	};

	useEffect(() => {
		const walletRemove = addWalletListener(setStatus);
		const chainRemove = addChainListener(setChainStatus);

		return () => {
			walletRemove?.();
			chainRemove?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="connect_button modal__btn" onClick={connectClicked}>
			<span>{btnTextFirst}</span>
			<span>{btnTextSecond}</span>
		</div>
	);
}
