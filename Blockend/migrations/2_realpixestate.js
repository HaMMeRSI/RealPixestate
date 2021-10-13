const RealPixestate = artifacts.require('RealPixestate');
const SimpleOracle = artifacts.require('SimpleOracle');
const MyToken = artifacts.require('MyToken');
// const RealPixestateNoSpatial = artifacts.require('RealPixestateNoSpatial');
// const _dependantContract = artifacts.require('DependantContract');

module.exports = async function (deployer, _network, accounts) {
	await deployer.deploy(MyToken);
	const myToken = await MyToken.deployed();
	await deployer.deploy(SimpleOracle);
	const oracle = await SimpleOracle.deployed();

	await myToken.mint(1000000, { from: accounts[1] });
	await myToken.mint(1000000, { from: accounts[2] });

	await oracle.setPrice(myToken.address, 1);
	await deployer.deploy(RealPixestate, oracle.address);
	await SimpleOracle.deployed();
	// await Promise.all([deployer.deploy(RealPixestate), deployer.deploy(RealPixestateNoSpatial)]);
	// const realPixestate = await RealPixestate.deployed();
	// await deployer.deploy(_dependantContract, 'Hello 2', realPixestate.address);
};
