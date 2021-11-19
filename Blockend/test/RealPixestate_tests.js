const RealPixestate = artifacts.require('RealPixestate');
const MyToken = artifacts.require('MyToken');
const truffleAssert = require('truffle-assertions');

contract('RealPixestate', (accounts) => {
	function breakTokenId(tokenId) {
		function Section(top, left, bottom, right) {
			return {
				top: parseInt(top),
				left: parseInt(left),
				bottom: parseInt(bottom),
				right: parseInt(right),
			};
		}

		const dimensions = 1000;
		const dimSquared = dimensions * dimensions;
		const tl = tokenId / dimSquared;
		const br = tokenId % dimSquared;

		const top = tl / dimensions;
		const left = tl % dimensions;

		const bottom = br / dimensions;
		const right = br % dimensions;

		return Section(top, left, bottom, right);
	}

	function getTokenId([aleft, atop], [bright, bbottom], size = 1000) {
		return (atop * size + aleft) * size * size + bbottom * size + bright;
	}

	function mapObj(obj, mapping) {
		return Object.keys(obj).map((x) => mapping(obj[x]));
	}

	it('should mint ETH', async () => {
		const realPixestate = await RealPixestate.deployed();
		const tok = getTokenId([995, 995], [996, 996]);
		const areaPrice = (4 * 0.01).toString();

		await realPixestate.safeMint(accounts[1], tok, '0x0000000000000000000000000000000000000000', '', {
			from: accounts[1],
			value: web3.utils.toWei(areaPrice, 'ether'),
		});
		
		assert.equal(await web3.eth.getBalance(realPixestate.address), web3.utils.toWei(areaPrice, 'ether'));
		assert.equal(await realPixestate.ownerOf(tok), accounts[1]);
	});

	// it('should mint', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();

	// 	await myToken.approve(realPixestate.address, 10000000, { from: accounts[1] });

	// 	await realPixestate.safeMint(accounts[1], getTokenId([0, 0], [9, 9]), myToken.address, '', { from: accounts[1] });
	// 	assert.equal((await myToken.balanceOf(accounts[0])).toNumber(), 100);
	// });

	// it('should mint with discount', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();

	// 	await myToken.approve(realPixestate.address, 10000000, { from: accounts[2] });
	// 	await realPixestate.grantDiscount(accounts[2], 10 * 10, 50);
	// 	await realPixestate.safeMint(accounts[2], getTokenId([10, 10], [19, 19]), myToken.address, '', { from: accounts[2] });
	// 	assert.equal((await myToken.balanceOf(accounts[0])).toNumber(), 150);
	// 	// await realPixestate.safeMint(accounts[0], getTokenId([45, 45], [500, 46]));
	// });

	// it('should mint with discount2', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();

	// 	await realPixestate.grantDiscount(accounts[2], 10 * 10, 100);
	// 	await realPixestate.safeMint(accounts[2], getTokenId([20, 20], [29, 29]), myToken.address, '', { from: accounts[2] });
	// 	assert.equal((await myToken.balanceOf(accounts[0])).toNumber(), 150);
	// 	// await realPixestate.safeMint(accounts[0], getTokenId([45, 45], [500, 46]));
	// });

	// it('Is invalid token', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();
	// 	await truffleAssert.reverts(realPixestate.safeMint(accounts[0], getTokenId([45, 45], [500, 10]), myToken.address, ''));
	// });

	// it('Is invalid token2', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();
	// 	await truffleAssert.reverts(realPixestate.safeMint(accounts[0], 9491229, myToken.address, ''));
	// });

	// it('Out side of bounds', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();
	// 	await truffleAssert.reverts(realPixestate.safeMint(accounts[0], getTokenId([45, 45], [1001, 500]), myToken.address, ''));
	// });

	// it('should be occupied', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const myToken = await MyToken.deployed();
	// 	await truffleAssert.reverts(realPixestate.safeMint(accounts[0], getTokenId([1, 1], [2, 2]), myToken.address, ''));
	// });

	// it('should break', async () => {
	// 	const realPixestate = await helloWorld.deployed();
	// 	const tokenId0 = getTokenId([100, 100], [149, 149]);
	// 	const myToken = await MyToken.deployed();
	// 	await realPixestate.safeMint(accounts[1], tokenId0, myToken.address, '', { from: accounts[1] });

	// 	assert.equal(await realPixestate.ownerOf(tokenId0), accounts[1]);

	// 	const tokenId1 = getTokenId([100, 100], [149, 140]);
	// 	const tokenId2 = getTokenId([100, 141], [145, 149]);
	// 	const tokenId3 = getTokenId([146, 141], [149, 149]);

	// 	await realPixestate.breakTokens(tokenId0, [tokenId1, tokenId2, tokenId3], {
	// 		from: accounts[1],
	// 	});

	// 	assert.equal(await realPixestate.ownerOf(tokenId1), accounts[1]);
	// 	assert.equal(await realPixestate.ownerOf(tokenId2), accounts[1]);
	// 	assert.equal(await realPixestate.ownerOf(tokenId3), accounts[1]);
	// 	await truffleAssert.reverts(realPixestate.ownerOf(tokenId0), 'ERC721: owner query for nonexistent token');
	// });

	// it('should merge', async () => {
	// 	const realPixestate = await helloWorld.deployed();

	// 	const tokenId0 = getTokenId([100, 100], [149, 149]);
	// 	const tokenId1 = getTokenId([100, 100], [149, 140]);
	// 	const tokenId2 = getTokenId([100, 141], [145, 149]);
	// 	const tokenId3 = getTokenId([146, 141], [149, 149]);

	// 	// await realPixestate.safeMint(accounts[0], tokenId1);
	// 	// await realPixestate.safeMint(accounts[0], tokenId2);
	// 	// await realPixestate.safeMint(accounts[0], tokenId3);

	// 	assert.equal(await realPixestate.ownerOf(tokenId1), accounts[1]);
	// 	assert.equal(await realPixestate.ownerOf(tokenId2), accounts[1]);
	// 	assert.equal(await realPixestate.ownerOf(tokenId3), accounts[1]);

	// 	await realPixestate.mergeTokens(tokenId0, [tokenId1, tokenId2, tokenId3], {
	// 		from: accounts[1],
	// 	});

	// 	assert.equal(await realPixestate.ownerOf(tokenId0), accounts[1]);
	// 	await truffleAssert.reverts(realPixestate.ownerOf(tokenId1), 'ERC721: owner query for nonexistent token');
	// 	await truffleAssert.reverts(realPixestate.ownerOf(tokenId2), 'ERC721: owner query for nonexistent token');
	// 	await truffleAssert.reverts(realPixestate.ownerOf(tokenId3), 'ERC721: owner query for nonexistent token');
	// });
});
