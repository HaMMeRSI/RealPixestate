import { MouseEvent as SyntheticMouseEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getPrices } from "../../Blockchain/RealpixestateContract";
import { breakTokenId, stopPropagation } from "../../Utils";
import "./Popup.css";

type Props = {
	tokenId: number;
	onClose: (e: SyntheticMouseEvent) => void;
	parentForPotal: React.RefObject<HTMLDivElement>;
	isVisible: boolean;
};

export default function Popup({ tokenId, onClose, parentForPotal, isVisible }: Props) {
	const [name, setName] = useState("");
	const [nameBio, setNameBio] = useState("");
	const [description, setDescription] = useState("");
	const [externalUrlText, setExternalUrlText] = useState("");
	const [externalUrl, setExternalUrl] = useState("");
	const [currency, setCurrency] = useState("ETH");
	const [prices, setPrices] = useState<any>({ ETH: 0.01, USDC: 1, DAI: 1, USDT: 1, TST: 1 });
	const mask = breakTokenId(tokenId);
	const area = (mask.w + 1) * (mask.h + 1);

	useEffect(() => {
		getPrices().then((prices) => setPrices(prices));
	}, []);

	return createPortal(
		<div className="modal-container" style={{ display: isVisible ? "flex" : "none" }} onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
			<div className="modal">
				<div className="modal__details">
					<h1 className="modal__title">Minting token: {tokenId}</h1>
					<p className="modal__description">{`(X: ${mask.x} Y:${mask.y}) - Width: ${mask.w + 1} Height: ${mask.h + 1}, Area: ${area}`}</p>
				</div>

				<div className="row">
					<span>
						<input className="gate" id="dpname" type="text" maxLength={40} placeholder="Max 40 characters" value={name} onChange={(e) => setName(e.target.value)} />
						<label htmlFor="dpname">Display name</label>
					</span>
				</div>
				<div className="row">
					<span>
						<input className="gate" id="biolink" type="text" maxLength={255} placeholder="Max 255 characters" value={nameBio} onChange={(e) => setNameBio(e.target.value)} />
						<label htmlFor="biolink">Bio link</label>
					</span>
				</div>
				<div className="row">
					<span>
						<input className="gate" id="descr" type="text" maxLength={255} placeholder="Max 255 characters" value={description} onChange={(e) => setDescription(e.target.value)} />
						<label htmlFor="descr">Description</label>
					</span>
				</div>
				<div className="row">
					<span>
						<input
							className="gate"
							id="urlTitle"
							type="text"
							maxLength={40}
							placeholder="Max 40 characters"
							value={externalUrlText}
							onChange={(e) => setExternalUrlText(e.target.value)}
						/>
						<label htmlFor="urlTitle">URL title</label>
					</span>
				</div>
				<div className="row">
					<span>
						<input className="gate" id="urlpop" type="text" maxLength={255} placeholder="Max 255 characters" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
						<label htmlFor="urlpop">URL</label>
					</span>
				</div>
				<div className="modal__footer">
					<select
						className="modal__currency"
						value={currency}
						onChange={(e) => {
							setCurrency(e.target.value);
						}}
					>
						{Object.keys(prices).map((ticker) => (
							<option key={ticker} value={ticker}>
								{prices[ticker] * area} {ticker}
							</option>
						))}
					</select>
					<button className="modal__btn" style={{ display: currency === "ETH" ? "none" : "block" }}>
						Approve &rarr;
					</button>
					<button className="modal__btn" style={{ margin: "0 0 0 auto" }}>
						Mint &rarr;
					</button>
				</div>

				<span className="link-2" onMouseUp={onClose}></span>
			</div>
		</div>,
		parentForPotal.current as HTMLDivElement
	);
}
