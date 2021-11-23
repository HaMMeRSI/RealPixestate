import { useEffect, useState } from "react";
import { TokenPrices } from "../types";
import { getPrices } from "./RealpixestateContract";


export default function usePrices() {
	const [prices, setPrices] = useState<TokenPrices>({ ETH: 0.01, USDC: 1, DAI: 1, USDT: 1, TST: 1 });

	useEffect(() => {
		getPrices().then((prices) => setPrices(prices));
	}, []);

	return prices;
}
