// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract DependantContract {
	string message;
	address public testsCon;

	constructor(string memory _message, address _testsCon) {
		message = _message;
		testsCon = _testsCon;
	}
}
