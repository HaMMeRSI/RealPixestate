import { CSSProperties } from "react";
import "./DescriptionBox.css";

type Metadata = {
	tokenId: number;
	description: string;
	external_url: string;
	external_url_text: string;
	name: string;
	name_bio: string;
};

type Props = {
	tokenId: number;
	scale: number;
};

function breakTokenId(tokenId: number) {
	function Section(top: number, left: number, bottom: number, right: number) {
		return {
			top: Math.floor(top),
			left: Math.floor(left),
			bottom: Math.floor(bottom),
			right: Math.floor(right),
		};
	}

	const dimensions = 1000;
	const dimSquared = dimensions * dimensions;
	const tl = tokenId / dimSquared;
	const br = tokenId % dimSquared;

	const top = tl / dimensions;
	const left = tl % dimensions;

	const bottom = br / dimensions;
	const right = br % dimensions;

	return Section(top, left, bottom, right);
}

const getBoxStyle = (tokenId: number, scale: number): CSSProperties => {
	const section = breakTokenId(tokenId);
	const adjScale = Math.min(3.5, Math.max(0.3, 1 / scale));

	return {
		position: "absolute",
		top: `${section.top + (section.bottom - section.top) / 5}px`,
		left: `${section.right + 15 * adjScale}px`,
		transform: `scale(${adjScale}`,
		transformOrigin: "0 0",
		cursor: "default",
		maxWidth: "50ch",
		fontSize: "1.2rem",
	};
};

export default function DescriptionBox({ tokenId, scale }: Props) {
	const contractAddress = "0x9a534628b4062e123ce7ee2222ec20b86e16ca8f";
	const metaData: Metadata = {
		tokenId: 998998999999,
		external_url: "Some Link Goes Here",
		external_url_text: "0000000000000000000000000000000000000000",
		description:
			"Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exc",
		name: "HaMMeRSI",
		name_bio: "Some Link Goes Here",
	};

	const address = "0x656dec5bb5405ca370288563efcc1fe17674679a";

	return (
		<div className="db_container" style={getBoxStyle(tokenId, scale)}>
			<div className="db_content">
				<div className="db_header">
					<div className="db_header_owner">
						<span>@</span>
						<a target="_blank" href={metaData.name_bio} className="db_header_owner_name">
							{metaData.name}
						</a>
						<span> owns: #</span>
						<a target="_blank" href={`https://etherscan.io/token/${contractAddress}?a=${tokenId}`}>
							{tokenId}
						</a>
					</div>
					<div className="db_header_address">
						<a target="_blank" href={`https://etherscan.io/address/${address}`}>
							{address}
						</a>
					</div>
				</div>
				<div className="db_description">{metaData.description}</div>
				<div className="db_link">
					<a target="_blank" href={metaData.external_url}>
						{metaData.external_url_text}
					</a>
				</div>
			</div>
		</div>
	);
}
