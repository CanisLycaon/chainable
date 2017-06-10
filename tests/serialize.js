"use strict";
const expect = require("expect.js"),
      chainable= require("../index");


describe("Chainable", function() {

  let C1, C2;

  before(function () {
    C1 = chainable({
      add (value, addend) { return value + (addend || 0); },
      sum () { return Array.prototype.slice.call(arguments).reduce((a, b) => a + b, 0); },
      time (a, b) {return a * b;},
      print (value, prefix, suffix) { return (prefix || "") + value + (suffix || ""); }
    });

    C2 = chainable({
      hello: "hi",
      toArray(...args) {
        return args;
      },
      push(arr = [], el) {
        arr.push(el);
        return arr;
      },
      each(arr, cb) {
        return arr.map(cb);
      }
    });
  });

  it("Can serialize", function () {
    expect(C1.add(2, 3).time(2).def()).to.be(`[{"name":"add","args":[2,3]},{"name":"time","args":[2]}]`);
  });

});