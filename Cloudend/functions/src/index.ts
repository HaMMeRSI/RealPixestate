import * as functions from "firebase-functions";
const url = require("url");
const https = require("https");
const ipfsClient = require("ipfs-http-client");
const infuraSecret = require("../secret_ipfs.json");

type Metadata = {
	tokenId: number;
	description: string;
	external_url: string;
	external_url_text: string;
	name: string;
	name_bio: string;
};

type CheckList = {
	description: Array<(str: string) => Promise<boolean | string>>;
	external_url: Array<(str: string) => Promise<boolean | string>>;
	external_url_text: Array<(str: string) => Promise<boolean | string>>;
	image: Array<(str: string) => Promise<boolean | string>>;
	name: Array<(str: string) => Promise<boolean | string>>;
	name_bio: Array<(str: string) => Promise<boolean | string>>;
	[key: string]: Array<(str: string) => Promise<boolean | string>>;
};

function checkLength(length: number) {
	return async (str: string) => {
		return str.length <= length || "Length exceeds " + length;
	};
}

function checkImage(imgUrl: string) {
	return new Promise<string | boolean>((resolve) => {
		const options = url.parse(imgUrl, true);
		options.timeout = 1500;
		let isgood = false;

		const request = https
			.get(options, function (response: any) {
				const chunks: any[] = [];
				response
					.on("data", function (chunk: any) {
						chunks.push(chunk);
						const buffer = Buffer.concat(chunks);
						if (buffer.length > 1_000_000) {
							request.destroy();
							resolve("file size too big, max 1 MB");
							isgood = true;
						}
					})
					.on("end", function () {
						isgood = true;
						resolve(true);
					})
					.on("error", () => {
						isgood = true;
						request.destroy();
					})
					.on("timeout", () => {
						isgood = true;
						request.destroy();
					});
			})
			.end();

		setTimeout(() => {
			!isgood && request.destroy();
			resolve("unknow error");
		}, 5000);
	});
}

function isOfType(type: string) {
	return async (str: any) => {
		return typeof str === type || `Type is wrong, expected ${type}`;
	};
}

async function exists(value: any) {
	return !!value || "Does not exists";
}

// eslint-disable-next-line no-unused-vars
async function areaIsFree(tokenId: string) {
	// TODO: Change and check in test net

	// const Web3 = require("web3");
	// const rpeAbi = require("../realPixestateABI.json");
	// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/be6a9161d5ea44d5ac7ebae84ac47fc4"));
	// const rpeAddr = "0x230663Fc6590B2ad329820eD13998920C40688E9";

	// const realPixestate = new web3.eth.Contract(rpeAbi, rpeAddr);
	// return !(await realPixestate.methods.areaIsOccupied(tokenId).call()) || "Some of the selected area is occupied, please choose another";
	return true;
}

const checkList: CheckList = {
	tokenId: [exists, isOfType("number"), areaIsFree],
	description: [exists, isOfType("string"), checkLength(255)],
	external_url: [exists, isOfType("string"), checkLength(255)],
	external_url_text: [exists, isOfType("string"), checkLength(40)],
	image: [exists, isOfType("string"), checkLength(255), checkImage],
	name: [exists, isOfType("string"), checkLength(40)],
	name_bio: [exists, isOfType("string"), checkLength(255)],
};

export const uploadToIpfs = functions.https.onRequest(async (request, response) => {
	response.set("Access-Control-Allow-Origin", "*");

	if (request.method === "OPTIONS") {
		// Send response to OPTIONS requests
		response.set("Access-Control-Allow-Methods", "GET");
		response.set("Access-Control-Allow-Headers", "Content-Type");
		response.set("Access-Control-Max-Age", "3600");
		response.status(204).send("");
		return;
	}

	const keys = Object.keys(checkList);
	try {
		for (const key of keys) {
			const tests = checkList[key];

			for (const test of tests) {
				const result = await test(request.body[key]);

				if (result !== true) {
					response.status(200).send(`Failed at ${key}, error: ${result}`);
					return;
				}
			}
		}

		const client = await getIpfsClient();

		// Strip potential redundant data
		const metaData: Metadata = keys.reduce((acc: any, curr: string) => {
			acc[curr] = request.body[curr];
			return acc;
		}, {} as Metadata);

		const result = await client.add(JSON.stringify(metaData));
		response.status(200).send({ metaData, result });
	} catch (e) {
		response.status(500).send(e);
		return;
	}
});

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
