const RealPixestateNoSpatial = artifacts.require('RealPixestateNoSpatial');
const truffleAssert = require('truffle-assertions');
contract('RealPixestateNoSpatial', (accounts) => {
	return;
	function getTokenId([aleft, atop], [bright, bbottom], size = 1000) {
		return (atop * size + aleft) * size * size + bbottom * size + bright;
	}

	function mapObj(obj, mapping) {
		return Object.keys(obj).map((x) => mapping(obj[x]));
	}

	it('mint test of gas', async () => {
		const realPixestateNoSpatial = await RealPixestateNoSpatial.deployed();
		console.log('wawa');
		await realPixestateNoSpatial.testMint(50);

		// const ps = [];
		// const js = 100;
		// for (let i = 0; i < 1000; i += js) {
		// 	console.log(i);
		// 	for (let j = 0; j < 1000; j += js) {
		// 		ps.push(realPixestateNoSpatial.safeMint(accounts[0], getTokenId([i, j], [i + 49, j + 49])));
		// 	}
		// 	await Promise.all(ps);
		// 	ps.length = 0;
		// }
	});

	it('collision test of gas', async () => {
		const realPixestateNoSpatial = await RealPixestateNoSpatial.deployed();
		const res1 = await realPixestateNoSpatial.testOcc(getTokenId([0, 0], [49, 49]));
		const res2 = await realPixestateNoSpatial.testOcc(getTokenId([33, 34], [34, 354]));
		const res3 = await realPixestateNoSpatial.testOcc(getTokenId([0, 0], [234, 49]));
		console.log(res1, res2, res3);
	});
});
