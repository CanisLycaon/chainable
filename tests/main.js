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

  it("Can chain it", function() {
    expect(C1.add(2).time(2).value(0)).to.be(4);
    expect(C1.add(2).sum(1, 3, 4).value(0)).to.be(10);
    expect(C1.add(2).time(2).print().value(0)).to.be("4");

    expect(C2.toArray(2).push(2).push(4).each(v => v * 3).value()).to.eql([6, 6, 12]);
  });

});