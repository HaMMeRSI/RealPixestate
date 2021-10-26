// SPDX-License-Identifier: NO-LICENSE
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IOracle.sol";
import "../interfaces/IERC2981.sol";

contract RealPixestate is ERC721, ERC721Burnable, Ownable, IERC2981 {
	struct Section {
		uint256 top;
		uint256 left;
		uint256 bottom;
		uint256 right;
	}

	uint256 private constant dimensions = 1000;

	uint256 private royaltiesPercentage;
	address private royaltiesReceiver;

	// discount to: [Area, amount]
	mapping(address => uint256[2]) private discounts;
	mapping(uint256 => uint256[]) private spatialMap;
	mapping(uint256 => string) public uris;
	mapping(address => uint256) public prices;

	uint256[] private usedTokenIds;

	constructor() ERC721("Real Pixestate", "RPX") {
		royaltiesReceiver = _msgSender();
		royaltiesPercentage = 0;
	}

	function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
		return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
	}

	function getUsedTokenIds() public view returns (uint256[] memory) {
		return usedTokenIds;
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "nonexistent token");
		return uris[tokenId];
	}

	function setUri(uint256 tokenId, string memory uri) public {
		require(ownerOf(tokenId) == _msgSender(), "Not your area");
		uris[tokenId] = uri;
	}

	function getSpatialHashes(uint256 tokenId) internal pure returns (uint256[] memory) {
		uint256 spatialDimensions = 10;
		uint256 spatialDimensionsSqr = spatialDimensions * spatialDimensions;

		Section memory section = breakTokenId(tokenId);
		Section memory spatialSection = Section(section.top / spatialDimensionsSqr, section.left / spatialDimensionsSqr, section.bottom / spatialDimensionsSqr, section.right / spatialDimensionsSqr);

		uint256 tHashes = (spatialSection.bottom - spatialSection.top + 1) * (spatialSection.right - spatialSection.left + 1);
		uint256[] memory hashes = new uint256[](tHashes);
		uint256 counter = 0;
		for (uint256 row = spatialSection.top; row <= spatialSection.bottom; row++) {
			for (uint256 col = spatialSection.left; col <= spatialSection.right; col++) {
				hashes[counter++] = row * spatialDimensions + col;
			}
		}

		return hashes;
	}

	function breakTokenId(uint256 tokenId) internal pure returns (Section memory) {
		uint256 dimSquared = dimensions * dimensions;
		uint256 tl = tokenId / dimSquared;
		uint256 br = tokenId % dimSquared;

		uint256 top = (tl / dimensions);
		uint256 left = (tl % dimensions);

		uint256 bottom = (br / dimensions);
		uint256 right = (br % dimensions);

		require(top <= bottom && left <= right, "Invalid tokenId");
		require(top < dimensions && left < dimensions && bottom < dimensions && right < dimensions, "Outside of bounds");

		return Section(top, left, bottom, right);
	}

	function isIntersecting(uint256 tokenId1, uint256 tokenId2) internal pure returns (bool) {
		Section memory Section1 = breakTokenId(tokenId1);
		Section memory Section2 = breakTokenId(tokenId2);
		return !(Section2.left > Section1.right || Section2.right < Section1.left || Section2.top > Section1.bottom || Section2.bottom < Section1.top);
	}

	function areaIsOccupied(uint256 tokenId) public view returns (bool) {
		uint256[] memory spatialHashes = getSpatialHashes(tokenId);

		uint256 sLength = spatialHashes.length;
		for (uint256 i = 0; i < sLength; i++) {
			uint256[] memory hashesInArea = spatialMap[spatialHashes[i]];
			uint256 hLength = hashesInArea.length;

			for (uint256 j = 0; j < hLength; j++) {
				if (isIntersecting(tokenId, hashesInArea[j])) {
					return true;
				}
			}
		}

		return false;
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

	function removeFromArray(uint256[] storage arr, uint256 data) internal returns (bool) {
		uint256[] memory mArr = arr;

		for (uint256 j = 0; j < mArr.length; j++) {
			if (data == mArr[j]) {
				arr[j] = mArr[mArr.length - 1];
				arr.pop();
				return true;
			}
		}

		return false;
	}

	function grantDiscount(
		address to,
		uint256 area,
		uint256 amount
	) external onlyOwner {
		require(area > 0 && amount > 0 && amount <= 100, "Invalid discount params");
		discounts[to] = [area, amount];
	}

	function handleMintTransfer(
		address _address,
		uint256 tokenId,
		address token
	) internal {
		Section memory section = breakTokenId(tokenId);
		uint256 area = (section.bottom - section.top + 1) * (section.right - section.left + 1);
		uint256 oPrice = prices[token];
		uint256 areaPrice = area * oPrice;
		(uint256 discountedArea, uint256 discountAmount) = (discounts[_address][0], discounts[_address][1]);

		if (discountedArea > 0) {
			areaPrice = areaPrice - ((discountedArea * oPrice * discountAmount) / 100);
			if (area >= discountedArea) {
				delete discounts[_address];
			} else {
				discounts[_address][0] = discountedArea - area;
			}
		}

		IERC20(token).transferFrom(_address, royaltiesReceiver, areaPrice);
	}

	function safeMint(
		address to,
		uint256 tokenId,
		address token
	) external {
		require(!areaIsOccupied(tokenId), "Area is occupied");
		populateSpatialMap(tokenId);
		usedTokenIds.push(tokenId);

		handleMintTransfer(_msgSender(), tokenId, token);
		_safeMint(to, tokenId);
	}

	function burnTokenId(uint256 tokenId) private {
		uint256[] memory spatialHashes = getSpatialHashes(tokenId);

		removeFromArray(usedTokenIds, tokenId);
		for (uint256 i = 0; i < spatialHashes.length; i++) {
			if (spatialMap[spatialHashes[i]].length > 0) {
				removeFromArray(spatialMap[spatialHashes[i]], tokenId);
			}
		}

		_burn(tokenId);
	}

	function populateSpatialMap(uint256 tokenId) private {
		uint256[] memory spatialHashes = getSpatialHashes(tokenId);
		for (uint256 i = 0; i < spatialHashes.length; i++) {
			spatialMap[spatialHashes[i]].push(tokenId);
		}
	}

	function breakTokens(uint256 tokenId, uint256[] memory newTokens) external {
		require(_isApprovedOrOwner(_msgSender(), tokenId), "not owner");
		require(isSubTokenOf(tokenId, newTokens), "Provided break is not fitting");

		burnTokenId(tokenId);

		for (uint256 i = 0; i < newTokens.length; i++) {
			_safeMint(_msgSender(), newTokens[i]);
			populateSpatialMap(newTokens[i]);
		}
	}

	function mergeTokens(uint256 tokenId, uint256[] memory oldTokens) external {
		for (uint256 i = 0; i < oldTokens.length; i++) {
			require(_isApprovedOrOwner(_msgSender(), oldTokens[i]), "not owner");
		}

		require(isSubTokenOf(tokenId, oldTokens), "bad merge");

		for (uint256 i = 0; i < oldTokens.length; i++) {
			burnTokenId(oldTokens[i]);
		}

		_safeMint(_msgSender(), tokenId);
		populateSpatialMap(tokenId);
		usedTokenIds.push(tokenId);
	}

	function revokeToken(uint256 tokenId) public onlyOwner {
		burnTokenId(tokenId);
	}

	function setRoyalties(uint256 _royaltiesPercentage) external {
		require(_msgSender() == royaltiesReceiver, "Only royalties receiver");
		royaltiesPercentage = _royaltiesPercentage;
	}

	function setPrice(address token, uint256 price) external onlyOwner {
		if (price == 0) {
			delete prices[token];
		}

		prices[token] = price;
	}

	function royaltyInfo(uint256, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount) {
		return (royaltiesReceiver, (_salePrice * royaltiesPercentage) / 100);
	}
}
