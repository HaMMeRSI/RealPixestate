// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract NON_USED {
	
	// function testMint(uint256 js) public {
	// 	for (uint256 row = 0; row < dimensions; row += js) {
	// 		for (uint256 col = 0; col < dimensions; col += js) {
	// 			uint256 tokenId = (row * dimensions + col) * dimensions * dimensions + ((row + js - 1) * dimensions + (col + js - 1));

	// 			uint256[] memory hashes = getSpatialHashes(tokenId);
	// 			for (uint256 k = 0; k < hashes.length; k++) {
	// 				spatialMap[hashes[k]].push(tokenId);
	// 			}

	// 			_safeMint(msg.sender, tokenId);
	// 		}
	// 	}
	// }

	function GasCost(string memory name, function(address, uint256) internal fun) internal returns (string memory) {
		uint256 u0 = gasleft();
		fun(msg.sender, 100100);
		uint256 u1 = gasleft();
		uint256 diff = u0 - u1;
		return string(abi.encodePacked(name, " GasCost: ", uint2str(diff)));
	}

	function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
		if (_i == 0) {
			return "0";
		}
		uint256 j = _i;
		uint256 len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint256 k = len;
		while (_i != 0) {
			k = k - 1;
			uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
			bytes1 b1 = bytes1(temp);
			bstr[k] = b1;
			_i /= 10;
		}
		return string(bstr);
	}
}
