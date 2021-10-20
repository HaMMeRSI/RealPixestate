import { CSSProperties } from "react";
import "./DescriptionBox.css";

type Props11 = {
	id: string;
	title: string;
	description: string;
	URI: string;
	URITitle: string;
	owner: string;
	ownerBio: string;
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
	};
};

export default function DescriptionBox({ tokenId, scale }: Props) {
	const props: Props11 = {
		URI: "asdasd",
		URITitle: "link to",
		description:
			"Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exceeds 255 characters Short description that does not exc",
		id: "",
		owner: "HaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSIHaMMeRSI",
		ownerBio: "wefwefwef",
		title: "Short description that does not exceeds 60 characters 123456",
	};
	const address = "0x656dec5bb5405ca370288563efcc1fe17674679a";
	return (
		<div className="db_container" style={getBoxStyle(tokenId, scale)}>
			<div className="db_content">
				<div className="db_header">
					<div className="db_header_owner">
						<span>@</span>
						<a href={props.ownerBio} className="db_header_owner_name">
							{props.owner}
						</a>
						<span> owns: #</span>
						<a href="LINK TO ETHERSCAN">{tokenId}</a>
					</div>
					<div className="db_header_address">
						<a href={`https://etherscan.io/address/${address}`}>{address}</a>
					</div>
				</div>
				<div className="db_title">{props.title}</div>
				<div className="db_description">{props.description}</div>
				<div className="db_link">
					<a href={props.URI}>{props.URITitle}</a>
				</div>
			</div>
		</div>
	);
}
