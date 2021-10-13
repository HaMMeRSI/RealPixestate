// SPDX-License-Identifier: NO-LICENSE
pragma solidity ^0.8.2;

import "../interfaces/IOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleOracle is IOracle, Ownable {
	mapping(address => uint256) prices;

	constructor() {
		// weth
		prices[address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)] = 1;
		// dai
		prices[address(0x6B175474E89094C44Da98b954EedeAC495271d0F)] = 1;
		// usdc
		prices[address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)] = 1;
		// wbtc
		prices[address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599)] = 1;
	}

	function getPrice(address token) external view returns (uint256) {
		return prices[token];
	}

	function changeAddress(
		address oldAddress,
		address newAddress,
		uint256 price
	) external onlyOwner {
		require(prices[oldAddress] != 0, "Nonexisting token");
		require(prices[newAddress] == 0, "This token already priced");

		delete prices[oldAddress];
		prices[newAddress] = price;
	}

	function deletePrice(address _address) external onlyOwner {
		delete prices[_address];
	}

	function setPrice(address _address, uint256 price) external onlyOwner {
		prices[_address] = price;
	}
}
