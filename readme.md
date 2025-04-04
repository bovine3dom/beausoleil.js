# beausoleil.js - a tiny monte-carlo based library for uncertain calculations

best to look at examples.js for usage really

PRs welcome, especially ones that improve performance.

# usage

```
beausoleil.mc({
    f: (x, y) => x * y, // simple multiplication
    vars: [{ bounds: [60, 70] }, { bounds: [500, 700] }],
    quantiles: [0.1, 0.5, 0.9],
    precision: 2,
    samples: 100,
})

// [ "34,000", "39,000", "44,000" ]
```

ES module so you can import it however you fancy
