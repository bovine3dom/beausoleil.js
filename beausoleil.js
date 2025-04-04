// generate an array samples long using sampler. probably only useful for debugging
export const r = (
    args,
    samples = 10000,
    sampler = (l, h) => (h - l) * Math.random() + l,
) => {
    const arr = new Array(samples)
    for (let i = 0; i < samples; i++) {
        arr[i] = sampler(...args)
    }
    return arr
}

// apply f to arrays 'row-wise', e.g. [a[0] + b[0] + c[0] + ..., a[1] + b[1] + ...]
export const broadcast = (f, ...arrays) => {
    const result = []
    const len = arrays[0].length
    for (let i = 0; i < len; i++) {
        const args = []
        for (const arr of arrays) {
            args.push(arr[i])
        }
        result.push(f(...args))
    }
    return result
}

/**
 * apply `f` to variables `vars` with bounds `[l, h]`, taking `samples` samples using `sampler` and returning `quantiles` quantiles
 *
 * the first element of vars will be supplied as the first argument to f, the second element as the second argument and so on.
 */
export function mc({
    f = x => x,
    vars = [], // each var has {bounds:[], sampler: bounds => one_sample, defaults to uniform}
    precision = 3,
    samples = 10000,
    quantiles = [0.25, 0.5, 0.75],
    formatter = result =>
        parseFloat(result.toPrecision(precision)).toLocaleString(),
    sort = array => array.sort((l, r) => l - r),
}) {
    const results = sort(
        broadcast(
            f,
            ...vars.map(obj =>
                r(
                    obj.bounds,
                    samples,
                    obj.sampler
                        ? obj.sampler
                        : (l, h) => (h - l) * Math.random() + l,
                ),
            ),
        ),
    )
    return quantiles.map(q => formatter(results[Math.floor(samples * q)]))
}

// sort arrays of arrays row-wise
export function rowSort(array2d) {
    const sortedTranspose = array2d[0].map((_, i) =>
        array2d.map(row => row[i]).sort((l, r) => l - r),
    )
    return sortedTranspose[0].map((_, i) => sortedTranspose.map(col => col[i]))
}

/**
 * Helper function for functions that return an array, such as a time series
 */
export function mc2d({
    f = x => [x],
    vars = [],
    precision = 3,
    formatter = x =>
        x.map(result =>
            parseFloat(result.toPrecision(precision)).toLocaleString(),
        ),
    sort = rowSort,
    ...rest
}) {
    return mc({ f, vars, formatter, sort, ...rest })
}

let _bM_freebie = null // box-muller is buy-one-get-one-free 😎

/**
 * Gaussian / Normal distribution sampler, lower/upper bounds are a convenience wrapper to set std and mean covering 95% of the distribution
 */
export function boxMuller({ lower, upper, std = 1, mean = 0 }) {
    // assume lower, upper are +/- 2std of mean
    if (lower != undefined && upper != undefined) {
        std = (upper - lower) / 4
        mean = (upper + lower) / 2
    }
    if (_bM_freebie !== null) {
        const theBestThingInLife = _bM_freebie
        _bM_freebie = null
        return theBestThingInLife * std + mean
    }

    let u1
    do {
        u1 = Math.random()
    } while (u1 === 0) // thou shalt not take the log of 0
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z1 = Math.sqrt(-2 * Math.log(u2)) * Math.sin(2 * Math.PI * u1)
    _bM_freebie = z1
    return z0 * std + mean
}
