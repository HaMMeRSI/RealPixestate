import { useEffect } from "react";
import { getTokenUri, getUsedTokens } from "./RealpixestateContract";

export default function useBlcokchainData(onData: (tokenId: number, uri: string) => void) {
	useEffect(() => {
		getAllData(onData);
	}, [onData]);
}

async function getAllData(onData: (tokenId: number, uri: string) => void): Promise<void> {
	const tokenIds = await getUsedTokens();
	for (const tokenId of tokenIds) {
		getTokenUri(tokenId).then((uri: string) => {
			onData(tokenId, uri);
		});
	}
}
