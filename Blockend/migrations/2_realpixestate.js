const Web3 = require('web3');
const RealPixestate = artifacts.require('RealPixestate');
const MyToken = artifacts.require('MyToken');
// const RealPixestateNoSpatial = artifacts.require('RealPixestateNoSpatial');
// const _dependantContract = artifacts.require('DependantContract');

function getTokenId([aleft, atop], [bright, bbottom], size = 1000) {
	return (atop * size + aleft) * size * size + bbottom * size + bright;
}

module.exports = async function (deployer, _network, accounts) {
	await deployer.deploy(MyToken);
	await deployer.deploy(RealPixestate);

	const realPixestate = await RealPixestate.deployed();
	const myToken = await MyToken.deployed();

	await myToken.mint(1000000, { from: accounts[1] });
	await myToken.mint(1000000, { from: accounts[2] });

	await realPixestate.setPrice('0x0000000000000000000000000000000000000000', Web3.utils.toWei('0.01', 'ether'));
	// test
	await realPixestate.setPrice(myToken.address, 1);
	// DAI
	await realPixestate.setPrice('0x6b175474e89094c44da98b954eedeac495271d0f', 1);
	// USDC
	await realPixestate.setPrice('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1);
	// USDT
	await realPixestate.setPrice('0xdac17f958d2ee523a2206206994597c13d831ec7', 1);

	await myToken.approve(realPixestate.address, 10000000, { from: accounts[1] });

	// await realPixestate.safeMint(accounts[1], getTokenId([0, 0], [4, 4]), myToken.address, "", { from: accounts[1] });
	// await realPixestate.safeMint(accounts[1], getTokenId([10, 10], [14, 14]), myToken.address, "", { from: accounts[1] });

	// await Promise.all([deployer.deploy(RealPixestate), deployer.deploy(RealPixestateNoSpatial)]);
	// const realPixestate = await RealPixestate.deployed();
	// await deployer.deploy(_dependantContract, 'Hello 2', realPixestate.address);
};
