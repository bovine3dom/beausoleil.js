import * as beausoleil from "./beausoleil.js"

// print f and time it took
function neowm(f) {
    let start,
        end = 0
    start = performance.now()
    console.log(f())
    end = performance.now()
    console.log(end - start)
}

console.log("normal distribution")
neowm(_ =>
    beausoleil.mc({
        f: (x, y) => x * y, // simple multiplication
        vars: [{ bounds: [60, 70] }, { bounds: [500, 700] }],
        quantiles: [0.1, 0.5, 0.9],
        precision: 2,
        samples: 1000, // a very small number of samples is fine for 2s.f. in most cases
    }),
)

console.log("uniform distribution")
neowm(_ =>
    beausoleil.mc({
        f: (x, y) => x * y,
        vars: [
            {
                bounds: [60, 70],
                sampler: beausoleil.uniform,
            },
            {
                bounds: [500, 700],
                sampler: beausoleil.uniform,
            },
        ],
        quantiles: [0.1, 0.5, 0.9],
        precision: 3,
        // samples: 3000000, // if you want stability to 3s.f. you need a stupid number of samples
        samples: 10000, // this is a reasonable compromise
    }),
)

console.log("time series")
neowm(_ =>
    beausoleil.mc2d({
        f: (x, rate) => [0, 1, 2, 3, 4, 5].map(y => x * rate ** y), // e.g. compound interest
        vars: [{ bounds: [230e3, 350e3] }, { bounds: [1.1, 1.13] }],
        quantiles: [0.1, 0.5, 0.9],
        samples: 10000,
    }),
)

console.log("big calculation with mixed distributions")
neowm(_ =>
    beausoleil.mc2d({
        f: (purchase_price, rate, rent, maintenance, refurbishment, area) =>
            [0, 1, 2, 3, 4, 5].map(
                y =>
                    (purchase_price + refurbishment * area - 100000) *
                        rate ** y - // constants should be added directly
                    rent * 12 * y +
                    maintenance * area * y,
            ), // e.g. purchase, refurbishment, rental, maintenance
        vars: [
            { bounds: [330e3, 350e3], sampler: beausoleil.boxMuller },
            { bounds: [1.05, 1.06], sampler: beausoleil.uniform },
            { bounds: [1000, 1200], sampler: beausoleil.boxMuller },
            { bounds: [3, 5], sampler: beausoleil.boxMuller },
            {
                bounds: [500, 700],
                sampler: beausoleil.boxMuller,
            },
            {
                bounds: [50, 60],
                sampler: beausoleil.uniform,
            },
        ],
        quantiles: [0.1, 0.5, 0.9],
        samples: 10000,
    }),
)

console.log("time series with varying rate")
const years = 5
let accumulator
neowm(_ =>
    beausoleil.mc2d({
        f: (x, rate) =>
            new Array(years + 1).fill().map(
                // fill() required because empty arrays can't be mapped
                ((accumulator = 1), // when map is called, accumulator is set to 1
                (_, i) => {
                    let result = x * accumulator
                    accumulator *= 1 * rate[i] // set up accumulator for the next iteration (i.e. force there to be a year 0)
                    return result
                }),
            ),
        vars: [
            { bounds: [230e3, 350e3] },
            {
                bounds: [1.1, 1.13],
                sampler: (...args) =>
                    new Array(years)
                        .fill()
                        .map(_ => beausoleil.boxMuller(...args)),
            }, // each sample returns years samples
        ],
        quantiles: [0.1, 0.5, 0.9],
        samples: 10000,
    }),
)

console.log(
    "boolean maths, sheffield -> paris using superfrog secret fares and eurostar snap",
)
// we have departure time as a uniform distribution (simplification, real departure times are e.g. hourly and seats will be less likely at peak times)
// journey time is either a poisson or normal distribution
// eurostar check-in time is a normal distribution
// then it becomes: depature + journey + check-in < departure
const sheffield_paris_samples = 100000
neowm(
    _ =>
        beausoleil
            .mc({
                f: (
                    sheffield_depart,
                    journey_time,
                    eurostar_check_in,
                    london_depart,
                ) =>
                    (sheffield_depart + journey_time + eurostar_check_in <
                        london_depart) +
                    0.0, // + 0.0 to cast bool to float
                vars: [
                    { bounds: [7 * 60, 12 * 60], sampler: beausoleil.uniform },
                    { bounds: [2 * 60, 2.1 * 60] },
                    { bounds: [30, 60] },
                    { bounds: [13 * 60, 20 * 60], sampler: beausoleil.uniform },
                ],
                samples: sheffield_paris_samples,
                raw: true,
            })
            .reduce((a, b) => a + b, 0) / sheffield_paris_samples, // take mean
)
