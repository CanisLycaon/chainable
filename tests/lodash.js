"use strict";
const expect = require("expect.js"),
      lodash = require("lodash"),
      chainable= require("../index");


describe("Chainable with lodash", function() {

  let _ = chainable(lodash);

  it("Can create independent chain constructors", function () {
    expect(_.toString(10).repeat(5).value()).to.be("1010101010");
  });
});