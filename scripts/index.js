const BN = require('BN.js');

function getRandomTokenId(size = 10000) {
	const points = new Array(size).fill(0).map((_, i) => new BN(i));
	const pointa = points[parseInt(Math.random() * size)];
	const pointb = points[parseInt(Math.random() * size)];

	const tl = BN.min(pointa, pointb);
	const br = BN.max(pointa, pointb);

	return tl.mul(new BN(size)).add(br);
}

function getTokenId([arow, acol], [brow, bcol], size = 1000) {
	return (arow * size + acol) * size * size + brow * size + bcol;
}

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

(function test(tokenId = 1010) {
	function BreakTokenId(tokenId) {
		const tl = tokenId / 10000;
		const br = tokenId % 10000;

		const top = tl / 100;
		const left = tl % 100;

		const bottom = br / 100;
		const right = br % 100;

		return [top, left, bottom - 1, right - 1].map((x) => parseInt(x));
	}

	function checkIntersection(tokenId1, tokenId2) {
		const [top1, left1, bottom1, right1] = BreakTokenId(tokenId1);
		const [top2, left2, bottom2, right2] = BreakTokenId(tokenId2);
		return !(left2 > right1 || right2 < left1 || top2 > bottom1 || bottom2 < top1);
	}

	function getTokenId(pa, pb, size = 100) {
		return (pa[0] * size + pa[1]) * size * size + pb[0] * size + pb[1];
	}

	function getSpatialHashes(size, tokenId) {
		const [top, left, bottom, right] = BreakTokenId(tokenId);
		const tlMapping = [top / size, left / size].map((x) => parseInt(x));
		const brMapping = [bottom / size, right / size].map((x) => parseInt(x));
		const hashes = [];

		for (let row = tlMapping[0]; row <= brMapping[0]; row++) {
			for (let col = tlMapping[1]; col <= brMapping[1]; col++) {
				hashes.push([row, col, row * size + col]);
			}
		}

		return hashes;
	}

	// return checkIntersection(getTokenId([0, 0], [1, 1]), getTokenId([1, 1], [2, 2]));

	return getSpatialHashes(5, getTokenId([3, 3], [6, 6]));
});

(function isSubTokenOf() {
	function Section(top, left, bottom, right) {
		return {
			top: parseInt(top),
			left: parseInt(left),
			bottom: parseInt(bottom),
			right: parseInt(right),
		};
	}
	function getTokenId([aleft, atop], [bright, bbottom], size = 1000) {
		return (aleft * size + atop) * size * size + bright * size + bbottom;
	}
	function breakTokenId(tokenId) {
		const dimensions = 1000;
		const dimSquared = dimensions * dimensions;
		const tl = tokenId / dimSquared;
		const br = tokenId % dimSquared;

		const left = tl / dimensions;
		const top = tl % dimensions;

		const right = br / dimensions;
		const bottom = br % dimensions;

		return Section(top, left, bottom, right);
	}

	const tokenId0 = getTokenId([100, 100], [149, 149]);
	const tokenId1 = getTokenId([100, 100], [149, 140]);
	const tokenId2 = getTokenId([100, 141], [145, 149]);
	const tokenId3 = getTokenId([146, 141], [149, 149]);
	const subTokens = [tokenId1, tokenId2, tokenId3];

	const section = breakTokenId(tokenId0);
	const mSection = Section(9999, 9999, 0, 0);
	const area = (section.bottom - section.top + 1) * (section.right - section.left + 1);
	let newArea = 0;

	for (let i = 0; i < subTokens.length; i++) {
		const cSection = breakTokenId(subTokens[i]);
		mSection.top = mSection.top < cSection.top ? mSection.top : cSection.top;
		mSection.left = mSection.left < cSection.left ? mSection.left : cSection.left;
		mSection.bottom = mSection.bottom > cSection.bottom ? mSection.bottom : cSection.bottom;
		mSection.right = mSection.right > cSection.right ? mSection.right : cSection.right;
		newArea = newArea + (cSection.bottom - cSection.top + 1) * (cSection.right - cSection.left + 1);
	}

	return newArea == area && mSection.top == section.top && mSection.left == section.left && mSection.bottom == section.bottom && mSection.right == section.right;
});

(function getSpatialHash() {
	function Section(top, left, bottom, right) {
		return {
			top: parseInt(top),
			left: parseInt(left),
			bottom: parseInt(bottom),
			right: parseInt(right),
		};
	}
	function getTokenId([aleft, atop], [bright, bbottom], size = 1000) {
		return (aleft * size + atop) * size * size + bright * size + bbottom;
	}
	function breakTokenId(tokenId) {
		const dimensions = 1000;
		const dimSquared = dimensions * dimensions;
		const tl = tokenId / dimSquared;
		const br = tokenId % dimSquared;

		const left = tl / dimensions;
		const top = tl % dimensions;

		const right = br / dimensions;
		const bottom = br % dimensions;

		return Section(top, left, bottom, right);
	}

	const tokenId = getTokenId([100, 0], [299, 0]);
	const spatialDimensions = 10;
	let section = breakTokenId(tokenId);
	let spatialSection = Section(section.top / spatialDimensions, section.left / spatialDimensions, section.bottom / spatialDimensions, section.right / spatialDimensions);
	console.log(spatialSection);
	let tHashes = (spatialSection.bottom - spatialSection.top + 1) * (spatialSection.right - spatialSection.left + 1);
	let hashes = new Array(tHashes).fill(0);
	let counter = 0;
	for (let row = spatialSection.top; row <= spatialSection.bottom; row++) {
		for (let col = spatialSection.left; col <= spatialSection.right; col++) {
			hashes[counter++] = row * spatialDimensions + col;
		}
	}

	return hashes;
});

(function a() {
	function Section(top, left, bottom, right) {
		return {
			top: parseInt(top),
			left: parseInt(left),
			bottom: parseInt(bottom),
			right: parseInt(right),
		};
	}
	function breakTokenId(tokenId) {
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
	function getSpatialHashes(tokenId) {
		const spatialDimensions = 10;
		const spatialDimensionsSqr = spatialDimensions * spatialDimensions;
		let section = breakTokenId(tokenId);
		let spatialSection = Section(
			section.top / spatialDimensionsSqr,
			section.left / spatialDimensionsSqr,
			section.bottom / spatialDimensionsSqr,
			section.right / spatialDimensionsSqr
		);

		let tHashes = (spatialSection.bottom - spatialSection.top + 1) * (spatialSection.right - spatialSection.left + 1);
		let hashes = new Array(tHashes);
		let counter = 0;
		for (let row = spatialSection.top; row <= spatialSection.bottom; row++) {
			for (let col = spatialSection.left; col <= spatialSection.right; col++) {
				hashes[counter++] = row * spatialDimensions + col;
			}
		}

		return hashes;
	}

	spatialMap = [];
	const dimensions = 1000;
	const js = 100;
	for (let row = 0; row < dimensions; row += js) {
		for (let col = 0; col < dimensions; col += js) {
			let tokenId = (row * dimensions + col) * dimensions * dimensions + ((row + 99) * dimensions + (col + 99));
			let hashes = getSpatialHashes(tokenId);
			for (let k = 0; k < hashes.length; k++) {
				if (!spatialMap[hashes[k]]) {
					spatialMap[hashes[k]] = [];
				}
				spatialMap[hashes[k]].push(tokenId);
			}
		}
	}

	return spatialMap.map(breakTokenId);
})();

module.exports = async function main(callback) {
	try {
		const accounts = await web3.eth.getAccounts();

		// const RealPixestateNoSpatial = artifacts.require('RealPixestateNoSpatial');
		// const realPixestate = await RealPixestateNoSpatial.deployed();

		const RealPixestate = artifacts.require('RealPixestate');
		const realPixestate = await RealPixestate.deployed();
		console.log(await realPixestate.testMintGas());
		// await realPixestate.testMint(50);
		// console.log(([await realPixestate.spatialMap(0, 0)]).map((x) => breakTokenId(x.toNumber())));
		// console.log(([await realPixestate.spatialMap(1, 0)]).map((x) => breakTokenId(x.toNumber())));
		// const js = 50;
		// for (let row = 0; row < 1000; row += js) {
		// 	for (let col = 0; col < 1000; col += js) {
		// 		const tokenId = getTokenId([row, col], [row + js - 1, col + js - 1]);
		// 		// const tokenId = (row * dimensions + col) * dimensions * dimensions + ((row + js - 1) * dimensions + (col + js - 1));
		// 		try {
		// 			await realPixestate.safeMint(accounts[0], tokenId);
		// 		} catch (e) {}
		// 	}
		// }
		// const areas = (1000 * 1000) / (100 * 100);
		// const arr = [];
		// for (let i = 0; i < areas; i++) {
		// 	const res = await realPixestate.getMap(i);
		// 	arr.push(res.map((x) => breakTokenId(x.toNumber())));
		// }
		// console.log(arr.flat());
		// console.log(await realPixestate.getSpatialHashes(getTokenId([0, 100], [0, 199])));
		// arr.push((await realPixestate.getMap(0)).map((x) => breakTokenId(x.toNumber())));
		// arr.push((await realPixestate.getMap(1)).map((x) => breakTokenId(x.toNumber())));

		callback(0);
	} catch (error) {
		console.error(error);
		callback(1);
	}
};
