import { CSSProperties, MouseEvent as SyntheticMouseEvent, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { realpixestateContext } from "../../App";
import { safeMint } from "../../Blockchain/RealpixestateContract";
import { acceptedTokenAddresses, allowance, approve } from "../../Blockchain/TokenContract";
import usePrices from "../../Blockchain/usePrices";
import usePrevious from "../../Hooks/usePrevious";
import { addToIpfs } from "../../IPFS/ipfsUtils";
import { breakTokenId, checkIntersection, stopPropagation, getImageSize } from "../../Utils";
import "./Popup.css";

type Props = {
	tokenId: number;
	onClose: (e?: SyntheticMouseEvent) => void;
	parentForPotal: React.RefObject<HTMLDivElement>;
	isVisible: boolean;
};

const errStyle: CSSProperties = {
	textAlign: "center",
	fontSize: "1.4rem",
};

function checkLength(length: number) {
	return async (str: string) => {
		return str.length <= length || "Length exceeds " + length;
	};
}

async function exists(value: any) {
	return !!value || "does not exists";
}

async function checkImage(imageURL: string) {
	const imageSize = await getImageSize(imageURL);
	return imageSize <= 1_000_000 || "Max image size: 1MB";
}

export default function Popup({ tokenId, onClose, parentForPotal, isVisible }: Props) {
	const [name, setName] = useState("");
	const [bioLink, setBioLink] = useState("");
	const [imageURL, setImageURL] = useState("");
	const [description, setDescription] = useState("");
	const [urlTitle, setUrlTitle] = useState("");
	const [externalUrl, setExternalUrl] = useState("");
	const [currency, setCurrency] = useState("ETH");
	const [validityResult, setValidityResult] = useState<boolean | string>(false);
	const [isOccupied, setIsOccupied] = useState(true);

	async function checkValidity() {
		const checkList: any[] = [
			[exists, { tokenId, name, imageURL, bioLink, description, urlTitle, externalUrl }],
			[checkLength(255), { description, bioLink, imageURL, externalUrl }],
			[checkLength(40), { name, urlTitle }],
			[checkImage, { imageURL }],
		];

		for (const checks of checkList) {
			const keys = Object.keys(checks[1]);
			for (const key of keys) {
				const result = await checks[0](checks[1][key]);
				if (result !== true) {
					return `${key} ${result}`;
				}
			}
		}

		return true;
	}

	const mask = breakTokenId(tokenId);
	const area = (mask.w + 1) * (mask.h + 1);

	const context = useContext(realpixestateContext);
	const prices = usePrices();

	useEffect(() => {
		setIsOccupied(
			checkIntersection(
				tokenId,
				context.tokensData.map(([tokenId, _uri]) => tokenId)
			)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isVisible]);

	useEffect(() => {
		checkValidity().then((result) => {
			setValidityResult(result);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokenId, name, bioLink, imageURL, description, urlTitle, externalUrl, currency]);

	const getPrice = (ticker: string) => prices[ticker] * area;

	const getFormBody = () => {
		if (isOccupied) {
			return <div style={errStyle}>Area is occupied!</div>;
		} else {
			return (
				<>
					<div className="row">
						<span>
							<input className="gate" id="dpname" type="text" maxLength={40} placeholder="Max 40 characters" value={name} onChange={(e) => setName(e.target.value)} />
							<label htmlFor="dpname">Display name</label>
						</span>
					</div>
					<div className="row">
						<span>
							<input
								className="gate"
								id="imageURL"
								type="text"
								maxLength={255}
								placeholder="Max 255 characters and 1MB"
								value={imageURL}
								onChange={(e) => setImageURL(e.target.value)}
							/>
							<label htmlFor="imageURL">Image URL</label>
						</span>
					</div>
					<div className="row">
						<span>
							<input className="gate" id="biolink" type="text" maxLength={255} placeholder="Max 255 characters" value={bioLink} onChange={(e) => setBioLink(e.target.value)} />
							<label htmlFor="biolink">Bio link</label>
						</span>
					</div>
					<div className="row">
						<span>
							<input
								className="gate"
								id="descr"
								type="text"
								maxLength={255}
								placeholder="Max 255 characters"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
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
								value={urlTitle}
								onChange={(e) => setUrlTitle(e.target.value)}
							/>
							<label htmlFor="urlTitle">URL title</label>
						</span>
					</div>
					<div className="row">
						<span>
							<input
								className="gate"
								id="urlpop"
								type="text"
								maxLength={255}
								placeholder="Max 255 characters"
								value={externalUrl}
								onChange={(e) => setExternalUrl(e.target.value)}
							/>
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
									{getPrice(ticker)} {ticker}
								</option>
							))}
						</select>
						<button className="modal__btn" style={{ display: currency === "ETH" ? "none" : "block" }} onClick={(_e) => onApproveClick()}>
							Approve &rarr;
						</button>
						<button className="modal__btn" style={{ margin: "0 0 0 auto" }} disabled={validityResult !== true} onClick={(_e) => onMintClick()}>
							Mint &rarr;
						</button>
					</div>
					<div className="modal__error">{validityResult === true ? "" : validityResult}</div>
				</>
			);
		}
	};

	const onApproveClick = async () => {
		await approve(acceptedTokenAddresses[currency]);
	};

	const onMintClick = async () => {
		if (validityResult !== true) {
			return;
		}

		const currAllowance = currency !== "ETH" ? await allowance(acceptedTokenAddresses[currency], context.walletAccount) : Number.MAX_VALUE;

		if (currAllowance >= getPrice(currency)) {
			const response = await addToIpfs({
				description: description,
				external_url: externalUrl,
				external_url_text: urlTitle,
				image: imageURL,
				name,
				name_bio: bioLink,
				tokenId,
			});

			if (response.status === 200) {
				const { status, result }: any = response.data;

				if (status === 0) {
					const resp = await safeMint(tokenId, currency, `https://ipfs.io/ipfs/${result.path}`);
					if (resp.success) {
						await context.reloadTokens();
						onClose();
						setName("");
						setBioLink("");
						setImageURL("");
						setDescription("");
						setUrlTitle("");
						setExternalUrl("");
						setValidityResult("");
					} else {
						setValidityResult(resp.status);
					}
				} else {
					setValidityResult(`Server error: ${result}`);
				}
			} else {
				setValidityResult("Server error: 500");
			}
		} else {
			setValidityResult("Please approve before minting");
		}
	};

	return createPortal(
		<div className="modal-container" style={{ display: isVisible ? "flex" : "none" }} onMouseDown={stopPropagation} onMouseUp={stopPropagation}>
			<div className="modal">
				<div className="modal__details">
					<h1 className="modal__title">Minting token: {tokenId}</h1>
					<p className="modal__description">{`(X: ${mask.x} Y:${mask.y}) - Width: ${mask.w + 1} Height: ${mask.h + 1}, Area: ${area}`}</p>
				</div>

				{getFormBody()}

				<span className="link-2" onMouseUp={onClose}></span>
			</div>
		</div>,
		parentForPotal.current as HTMLDivElement
	);
}
