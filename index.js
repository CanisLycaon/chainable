/**
 * Convert any function library into chainable library.
 */

function Chainable(obj, options = {}) {
  if (!obj) throw new Error("Please provide a valid function library.");
  const storage = {};
  storage._obj = Object.create(obj);
  storage._opts = Object.assign({
    // default options
  }, options);

  // the instance returned by any function call in between
  function ChainInstance(store = function () { }, from) {
    // the store contains all information
    //   - the function we called
    //   - and the args we want to pass into
    return new Proxy(store, {
      apply: function (target, thisArg, args) {
        // return a ChainInstance with previous functions
        target.fns = target.fns || [];
        if (from === "get") {
          target.fns[target.fns.length - 1].args = args;
        }
        return new ChainInstance(target, "call");
      },
      get: function (target, name, receiver) {
        switch (name) {
          case "value":
            return function (...args) {
              // now start execute all fns
              let v;
              for (let i = 0, len = target.fns.length; i < len; i++) {
                let fn = target.fns[i];
                let fnArgs = fn.args ? Array.from(fn.args) : [];
                if (i === 0) {
                  // merge args passed into value() with first fn's args
                  fnArgs = args.concat(fnArgs);
                } else {
                  fnArgs.unshift(v);
                }
                v = fn.fn.apply(receiver, fnArgs);
              }
              return v;
            };

          // return the function
          case "_origin":
            return target.origin;

          // retrieve all functions along the chain
          case "def":
            return function () {
              target.fns.toString = function() {
                return JSON.stringify(target.fns.map(fn => {
                  return { name: fn.fn.name, args: fn.args };
                }));
              }
              return target.fns;
            }

          // serialize the fns
          case "serialize":
            // WARNING: serialize will lose all format information, be carefully when deal with format sensitive manipulation
            return function() {
              return target.fns.map(fn => `${fn.fn.name}${fn.args ? `(${fn.args.join(",")})` : ""}`).join(".");
            };

          default:
            let obj = storage._obj;
            if (typeof obj[name] === "undefined") return receiver;
            let fn = typeof obj[name] === "function" ? obj[name] : function () { return obj[name]; };
            Object.defineProperty(fn, "name", { writable: true });
            fn.name = name;

            // return a ChainInstance with previous functions
            target.fns = target.fns || [];
            target.fns.push({ fn });
            target.fn = fn;
            target.origin = obj[name];
            return new ChainInstance(target, "get");
        }
      }
    });
  };

  // every methods inside of the obj should also be accessible after convert to chainable one
  return new Proxy(storage, {
    get: function (target, name, receiver) {
      let obj = storage._obj;
      let store = function () { };
      store.fns = [];
      switch (name) {
        case "register":
          // allow register new functions afterwards
          return function (name, fn) {
            if (typeof name === "function") {
              fn = name;
              name = fn.name;
            }
            if (!name) throw Chainable.CONSTANTS.errors.REGISTER_FUNCTION_NAME;
            obj[name] = fn;
          };

        case "def":
          return function () {
            return Chainable.CONSTANTS.errors.NO_VALID_METHOD_PROPERTY;
          }
        
        case "deserialize":
          return function (str) {
            str.split(".").forEach(item => {
              let [name, args] = item.split(/[()]/g);
              args = args ? args.split(",") : undefined;
              if (typeof obj[name] === "undefined") return;
              let fn = typeof obj[name] === "function" ? obj[name] : function () { return obj[name]; };
              Object.defineProperty(fn, "name", { writable: true });
              fn.name = name;
              if (args) store.fns.push({ fn, args });
              else store.fns.push({ fn });
              store.fn = fn;
              store.origin = obj[name];
            });
            return new ChainInstance(store, "get");
          };

        default:
          if (typeof obj[name] === "undefined") return receiver;
          let fn = typeof obj[name] === "function" ? obj[name] : function () { return obj[name]; };
          Object.defineProperty(fn, "name", { writable: true });
          fn.name = name;

          // return a ChainInstance with previous functions
          store.fns.push({ fn });
          store.fn = fn;
          store.origin = obj[name];

          return new ChainInstance(store, "get");
      }
    }
  });
}

Chainable.CONSTANTS = {
  errors: {
    NO_VALID_METHOD_PROPERTY: "No valid method or property chained.",
    REGISTER_FUNCTION_NAME: "Named function required."
  }
};


module.exports = Chainable;