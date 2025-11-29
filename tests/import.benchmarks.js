async function getBenchmarkPackage() {

    let _Benchmark

    if (typeof Benchmark === 'undefined' || Benchmark === undefined) {
        const benchmarkPackage = await import('benchmark')
        _Benchmark = benchmarkPackage.default
    } else {
        _Benchmark = Benchmark
    }

    return _Benchmark

}

export { getBenchmarkPackage }
