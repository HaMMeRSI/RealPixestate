const ipfsClient = require("ipfs-http-client");
const infuraSecret = require("../secret_ipfs.json");
// const fs = require("fs");
const Web3 = require("web3");
const rpeAbi = require("../realPixestateABI.json");
const tokenAbi = require("./tokenABI");

function getTokenId([arow, acol], [brow, bcol], size = 1000) {
	return (arow * size + acol) * size * size + brow * size + bcol;
}

(async function () {
	// const client = await getIpfsClient();
	try {
		// const res = await client.add({
		// 	path: "Hello.txt",
		// 	content: JSON.stringify({
		// 		one: "Hello",
		// 		two: "Infura",
		// 		three: "And IPFS",
		// 	}),
		// });

		// const testFile = fs.readFileSync("./package.json");
		// const res = await client.add(testFile);

		// const chunks = [];
		// const catIter = client.cat(res.cid);
		// for await (const data of catIter) {
		// 	chunks.push(data);
		// 	// console.log(Buffer.from(data).toString());
		// }

		// console.log(Buffer.concat(chunks).toString());

		var web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:9545"));
		const rpeAddr = "0x230663Fc6590B2ad329820eD13998920C40688E9";
		const tokAddr = "0x07857D7Bb342d855F4b6183ADce3071876EFc2E6";
		const account = "0x97803C0597300E78E58f7C92d56Ee260Be9Ab464";

		const realPixestate = new web3.eth.Contract(rpeAbi, rpeAddr);
		const token = new web3.eth.Contract(tokenAbi, tokAddr);
		const tokenId = getTokenId([0, 0], [9, 9]);

		const areaIsOccupied = await realPixestate.methods.areaIsOccupied(tokenId).call({ from: account });
		if (!areaIsOccupied) {
			if (await token.methods.approve(rpeAddr, 30000000).send({ from: account })) {
				const safeMint = realPixestate.methods.safeMint(account, tokenId, tokAddr);
				const gas = await safeMint.estimateGas({ from: account });
				console.log(await safeMint.send({ from: account, gas }));
			}
		} else {
			console.log("areaIsOccupied");
		}
		// console.log(a);
	} catch (e) {
		console.log(e);
	}
})();

// eslint-disable-next-line no-unused-vars
async function getIpfsClient(isLocalHost = false) {
	if (isLocalHost) {
		return await ipfsClient.create("/ip4/127.0.0.1/tcp/5001");
	}

	const auth = "Basic " + Buffer.from(infuraSecret["PROJECT ID"] + ":" + infuraSecret["PROJECT SECRET"]).toString("base64");
	return await ipfsClient.create({
		host: "ipfs.infura.io",
		port: 5001,
		protocol: "https",
		headers: {
			authorization: auth,
		},
	});
}
