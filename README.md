## Chainable

Inspired by [chainable.js from Adam](https://github.com/adamjeffries/chainable.js)

### Usage

convert any existing function library into chainable libraries.

example:

``` javascript
C1 = chainable({
  add (value, add) {
    return value + (add || 0);
  },
  sum () {
    return Array.prototype.slice.call(arguments).reduce((a, b) => a + b, 0);
  },
  time (a, b) {
    return a * b;
  },
  print (value, prefix, suffix) {
    return (prefix || "") + value + (suffix || "");
  }
});

// now you can use C1 with chained functions:

C1.add(1, 2).sum(3, 4).time(2).value(); // 20
```


#### Use with lodash

The best usage with chainable will be combine it with lodash and other existing libraries.

``` javascript
let _ = chainable(lodash);

_.toString(10).repeat(5).value(); // "1010101010"
```

### Tips

The concept behind the chainable is pretty simple:

`store the result from previous execution and pass it along the chain. When pass, always set as the first argument.`

So any library follow that rule will be able to converted to chaniable library.