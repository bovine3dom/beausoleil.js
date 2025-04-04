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

console.log("uniform")
neowm(_ =>
    beausoleil.mc({
        f: (x, y) => x * y,
        vars: [{ bounds: [60, 70] }, { bounds: [500, 700] }],
        quantiles: [0.1, 0.5, 0.9],
        precision: 2,
        samples: 100,
    }),
)

console.log("normal")
neowm(_ =>
    beausoleil.mc({
        f: (x, y) => x * y,
        vars: [
            { bounds: [60, 70], sampler: beausoleil.boxMuller },
            { bounds: [500, 700], sampler: beausoleil.boxMuller },
        ],
        quantiles: [0.1, 0.5, 0.9],
        precision: 2,
    }),
)

// neowm(_=>beausoleil.mc2d({f:(x,rate) => [0,1,2,3,4,5].map(y => x*(rate**y)), vars:[{bounds:[230e3, 350e3]}, {bounds:[1.1, 1.13]}], quantiles:[0.1, 0.5, 0.9], samples:10000}))
