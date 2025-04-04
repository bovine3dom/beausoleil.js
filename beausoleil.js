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

console.log(mc({f:(x,y) => x*y+1, vars:[{bounds:[1e7, 11e7]}, {bounds:[-1, 3]}], quantiles:[0.1, 0.5, 0.9], precision:2}))
        


// for arrays of arrays we want to sort each one row-wise
function rowSort(array2d) {
    const sortedTranspose = array2d[0].map((_, i) => array2d.map(row => row[i]).sort((l,r)=>l-r))
    return sortedTranspose[0].map((_, i) => sortedTranspose.map(col => col[i]))
}

console.log(mc({f:(x,rate) => [0,1,2,3,4,5].map(y => x*(rate**y)), vars:[{bounds:[230e3, 350e3]}, {bounds:[1.1, 1.13]}], quantiles:[0.1, 0.5, 0.9], formatter:x=>x.map(result=>parseFloat(result.toPrecision(3))), sort:rowSort})) //
