// SPDX-License-Identifier: NO-LICENSE
pragma solidity ^0.8.2;

interface IOracle {
	function getPrice(address) external view returns (uint256);
}
