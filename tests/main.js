"use strict";
const expect = require("expect.js"),
      chainable= require("../index");


describe("Chainable", function() {

  let C1, C2, O1, O2;

  before(function () {
    O1 = {
      add (value, addend) { return value + (addend || 0); },
      sum () { return Array.prototype.slice.call(arguments).reduce((a, b) => a + b, 0); },
      time (a = 1, b = 1) {return a * b;},
      print (value, prefix, suffix) { return (prefix || "") + value + (suffix || ""); }
    };
    C1 = chainable(O1);
    
    O2 = {
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
    };
    C2 = chainable(O2);
  });

  describe("test on interface on chainable functions", function () {
    it("can access original methods", function () {
      expect(C1.add._origin == O1.add).to.be(true);
      expect(C1.sum._origin == O1.sum).to.be(true);
      expect(C1.print._origin == O1.print).to.be(true);

      expect(C2.toArray._origin == O2.toArray).to.be(true);
    });

    it("can access original properties", function() {
      expect(C2.hello._origin == O2.hello).to.be(true);
    });

    it("has register function", function() {
      expect(C2.register).to.be.a("function");
    });

    it("has def function", function() {
      expect(C2.def).to.be.a("function");
    });

  });

  describe("test on chain and evaluate it", function () {
    it("can chain and call with no value", function () {
      expect(C1.add(2).time(2).value()).to.be(4);
      expect(C1.add(2).sum(1, 3, 4).value()).to.be(10);
      expect(C2.toArray(2).push(2).push(4).each(v => v * 3).value()).to.eql([6, 6, 12]);
    });

    it("can chain and call with single value, honor the value passed in with value()", function () {
      expect(C1.add.time(2).value(3)).to.be(6);
      expect(C1.add(2).time(2).print().value(0)).to.be("4");
      expect(C2.toArray(2).push(2).push(4).each(v => v * 3).value(1)).to.eql([3, 6, 6, 12]);
    });

    it("can chain and call with multiple values", function () {
      expect(C1.sum.value(1, 2, 3)).to.be(6);
      expect(C1.sum.add(2).time.time.time(2).value(1, 2, 3)).to.be(16);
      expect(C2.toArray.value(1, 2, 3)).to.eql([1, 2, 3]);
    });
  });


  describe("test on chain on invalid props", function () {
    it("can chain and call with multiple invalid values", function () {
      expect(C1.dd.ddddd.ddddd).to.be.ok;
      expect(C1.dd.ddddd.ddddd.def()).to.be(chainable.CONSTANTS.errors.NO_VALID_METHOD_PROPERTY);
    });

    it("can chain and call with mixed invalid and valid values", function () {
      expect(C1.dd.add.ddddd.def() + "").to.be(`[{"name":"add"}]`);
    });
  });

  describe("test on register", function () {
    it("can register with valid name and function", function () {
      C1.register("minus", function(value, minus) {
        return value - minus;
      });

      expect(C1.add(2).minus(1).value(5)).to.be(6);
    });

    it("can register with valid function with name", function () {
      C1.register(function divide(value, divideBy) {
        return value / divideBy;
      });

      expect(C1.add(2).minus(1).divide(2).value(5)).to.be(3);
    });

    it("invalid register", function() {
      expect(C1.register).withArgs(function(){}).to.throwException(chainable.CONSTANTS.errors.REGISTER_FUNCTION_NAME);
    });
  });

  describe("def retrieve", function(){
    it("can retrieve def with all valid methods", function() {
      let def1 = C1.add(2, 3).time().time(2).def();
      expect(def1 + "").to.be(`[{"name":"add","args":[2,3]},{"name":"time","args":[]},{"name":"time","args":[2]}]`);
      expect(def1[0].fn === O1.add).to.be(true);
      expect(def1[0].args).to.eql([2, 3]);

      let def2 = C1.add.time(2).print.time.time.add.minus.divide.def();
      expect(def2 + "").to.be(`[{"name":"add"},{"name":"time","args":[2]},{"name":"print"},{"name":"time"},{"name":"time"},{"name":"add"},{"name":"minus"},{"name":"divide"}]`);
      expect(def2[4].fn === O1.time).to.be(true);
    });

    it("can retrieve def with invalid methods", function() {
      let def = C1.add(2, 3).dd.ddd.dd.time(2).def();
      expect(def.length).to.be(2);
      expect(def + "").to.be(`[{"name":"add","args":[2,3]},{"name":"time","args":[2]}]`);
    });
  })

  describe("serialize and deserialize", function(){
    it("can serialize with valid methods", function() {
      expect(C1.add(2, 3).dd.ddd.dd.time.time(2).serialize()).to.be(`add(2,3).time.time(2)`);
    });

    it("can serialize with invalid methods(ignore automatically)", function() {
      let str = C1.minus(10, 3).dd.ddd.dd.time.time(2).serialize();
      expect(C1.deserialize(str).value()).to.be(14);
    });
  })
});