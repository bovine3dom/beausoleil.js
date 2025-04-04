r = (args, samples=10000, sampler=(l, h)=>(h-l)*Math.random()+l) => {
    const arr = new Array(samples)
    for (let i = 0; i < samples; i++) {
        arr[i] = sampler(...args)
    }
    return arr
}

broadcast = (f, ...arrays) => {
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

function mc({f=x=>x, vars=[], precision=3, samples=10000, quantiles=[0.5], formatter=result=>parseFloat(result.toPrecision(precision)), sort=array=>array.sort((l,r)=>l-r)}) {
    // each var has {bounds:[], sampler: bounds => one_sample, defaults to uniform}
    const results = sort(broadcast(f, ...vars.map(obj => r(obj.bounds, samples, obj.sampler ? obj.sampler : (l, h)=>(h-l)*Math.random()+l))))
    return quantiles.map(q => formatter(results[Math.floor(samples*q)]))
}

c = broadcast((x,y)=>x*y+1, r([1e7,11e7]), r([-1,3])).sort((l,r)=>l-r)

console.log(c[Math.floor(samples/10)].toPrecision(3))
console.log(c[Math.floor((2*samples)/4)].toPrecision(3))
console.log(c[Math.floor((9*samples)/10)].toPrecision(3))

console.log(mc({f:(x,y) => x*y+1, vars:[{bounds:[1e7, 11e7]}, {bounds:[-1, 3]}], quantiles:[0.1, 0.5, 0.9], precision:2}))
        
console.log(mc({f:(x,rate) => [0,1,2,3,4,5].map(y => x*(rate**y)), vars:[{bounds:[230e3, 350e3]}, {bounds:[1.1, 1.13]}], quantiles:[0.1, 0.5, 0.9], formatter:x=>x, sort:x=>x.sort((l,r)=>l.slice(-1) - r.slice(-1))})) //
