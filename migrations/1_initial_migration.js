const Migrations = artifacts.require('Migrations')

module.exports = function (deployer) {
	deployer.deploy(Migrations)
}
;
(function a() {
	function toCantorNum([a, b]) {
		return ((a + b + BigInt(1)) * (a + b)) / BigInt(2) + b
	}

	function fromCantor(cantor) {
		function sqrt(value) {
			if (value < 0n) {
				throw 'square root of negative numbers is not supported'
			}

			if (value < 2n) {
				return value
			}

			function newtonIteration(n, x0) {
				const x1 = (n / x0 + x0) >> 1n
				if (x0 === x1 || x0 === x1 - 1n) {
					return x0
				}
				return newtonIteration(n, x1)
			}

			return newtonIteration(value, 1n)
		}

		const w = (sqrt(BigInt(8) * cantor + BigInt(1)) - BigInt(1)) / BigInt(2)
		const t = (w * w + w) / BigInt(2)
		return [w - (cantor - t), cantor - t]
	}

	const points = new Array(1000000).fill(0).map((_, i) => BigInt(i))
	// .map((_, i) => [parseInt(i / 1000), i % 1000])
	// .map(([a, b]) => [BigInt(a), BigInt(b)])
	// let cantors = points.map(toCantorNum)

	// return cantors
	let max = BigInt(0)
	for (let i = 0; i < cantors.length; i++) {
		max = cantors[i] > max ? cantors[i] : max
	}
	return toCantorNum([toCantorNum([max, max]), toCantorNum([max, max])])

	const ret = cantors.map(fromCantor)
	return ret
	for (let i = 0; i < ret.length; i++) {
		if (ret[i][0] !== points[i][0] || ret[i][1] !== points[i][1])
			return false
	}

	return true
	// const hash = toCantorNum([toCantorNum([100000, 100000]), toCantorNum([999999, 999999])]);
})
