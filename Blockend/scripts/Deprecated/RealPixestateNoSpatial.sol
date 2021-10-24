// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealPixestateNoSpatial is ERC721, ERC721Burnable, Ownable {
	struct Section {
		uint256 top;
		uint256 left;
		uint256 bottom;
		uint256 right;
	}

	uint256[] usedTokenId;
	uint256 public constant dimensions = 1000;
	mapping(uint256 => string) public uris;

	constructor() ERC721("Real Pixestate", "RPX") {}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
		return uris[tokenId];
	}

	function setUri(uint256 tokenId, string memory uri) public {
		require(ownerOf(tokenId) == _msgSender(), "Not your newArea");
		uris[tokenId] = uri;
	}

	function breakTokenId(uint256 tokenId) public pure returns (Section memory) {
		uint256 dimSquared = dimensions * dimensions;
		uint256 tl = tokenId / dimSquared;
		uint256 br = tokenId % dimSquared;

		uint256 left = (tl / dimensions);
		uint256 top = (tl % dimensions);

		uint256 right = (br / dimensions);
		uint256 bottom = (br % dimensions);

		require(top <= bottom && left <= right, "Invalid tokenId");
		require(top < dimensions && left < dimensions && bottom < dimensions && right < dimensions, "Outside of bounds");

		return Section(top, left, bottom, right);
	}

	function isIntersecting(uint256 tokenId1, uint256 tokenId2) internal pure returns (bool) {
		Section memory Section1 = breakTokenId(tokenId1);
		Section memory Section2 = breakTokenId(tokenId2);
		return !(Section2.left > Section1.right || Section2.right < Section1.left || Section2.top > Section1.bottom || Section2.bottom < Section1.top);
	}

	function safeMint(address to, uint256 tokenId) public {
		uint256 sLength = usedTokenId.length;
		for (uint256 i = 0; i < sLength; i++) {
			if (isIntersecting(tokenId, usedTokenId[i])) {
				revert("Area is occupied");
			}
		}

		usedTokenId.push(tokenId);
		_safeMint(to, tokenId);
	}

	function isSubTokenOf(uint256 tokenId, uint256[] memory subTokens) internal pure returns (bool) {
		Section memory section = breakTokenId(tokenId);
		Section memory mSection = Section(9999, 9999, 0, 0);
		uint256 area = (section.bottom - section.top + 1) * (section.right - section.left + 1);
		uint256 newArea;

		for (uint256 i = 0; i < subTokens.length; i++) {
			Section memory cSection = breakTokenId(subTokens[i]);
			mSection.top = mSection.top < cSection.top ? mSection.top : cSection.top;
			mSection.left = mSection.left < cSection.left ? mSection.left : cSection.left;
			mSection.bottom = mSection.bottom > cSection.bottom ? mSection.bottom : cSection.bottom;
			mSection.right = mSection.right > cSection.right ? mSection.right : cSection.right;
			newArea = newArea + ((cSection.bottom - cSection.top + 1) * (cSection.right - cSection.left + 1));
		}

		return newArea == area && mSection.top == section.top && mSection.left == section.left && mSection.bottom == section.bottom && mSection.right == section.right;
	}

	function breakTokens(uint256 tokenId, uint256[] memory newTokens) public {
		require(_isApprovedOrOwner(_msgSender(), tokenId), "not owner");
		require(isSubTokenOf(tokenId, newTokens), "Provided break is not fitting");

		burn(tokenId);

		for (uint256 i = 0; i < newTokens.length; i++) {
			_safeMint(_msgSender(), newTokens[i]);
		}
	}

	function mergeTokens(uint256 tokenId, uint256[] memory oldTokens) public {
		for (uint256 i = 0; i < oldTokens.length; i++) {
			require(_isApprovedOrOwner(_msgSender(), oldTokens[i]), "not owner");
		}

		require(isSubTokenOf(tokenId, oldTokens), "Provided merge is not fitting");

		for (uint256 i = 0; i < oldTokens.length; i++) {
			burn(oldTokens[i]);
		}

		_safeMint(_msgSender(), tokenId);
	}

	function testMint(uint256 js) public {
		uint256 res = (dimensions * dimensions) / (js * js);
		uint256[] memory usedTokenIdd = new uint256[](res);
		uint256 c;
		for (uint256 i = 0; i < dimensions; i += js) {
			for (uint256 j = 0; j < dimensions; j += js) {
				// safeMint(msg.sender, (i * dimensions + j) * dimensions * dimensions + (i + 49) * dimensions + (j + 49));
				uint256 tokenId = (i * dimensions + j) * dimensions * dimensions + (i + 49) * dimensions + (j + 49);
				_safeMint(msg.sender, tokenId);
				usedTokenIdd[c++] = tokenId;
			}
		}

		usedTokenId = usedTokenIdd;
	}
}
