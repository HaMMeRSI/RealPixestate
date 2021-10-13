// SPDX-License-Identifier: NO-LICENSE
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
	constructor() ERC20("My Token", "MTKN") {}

	function mint(uint256 amount) external {
		_mint(_msgSender(), amount);
	}
}
