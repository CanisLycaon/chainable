/**
 * 
 */

function Chainable(obj, options = {}) {
  if (!obj) throw new Error("Please provide a valid function library.");
  const storage = {};
  storage._obj = obj;
  storage._opts = options;

  function ChainInstance(store = function () { }, from) {
    // return an instance has access to all methods in obj
    return new Proxy(store, {
      apply: function (target, thisArg, args) {
        // return a ChainInstance with previous functions
        target.fns = target.fns || [];
        if (from === "get") {
          target.fns[target.fns.length - 1].thisArg = thisArg;
          target.fns[target.fns.length - 1].args = args;
        }
        return new ChainInstance(target, "call");
      },
      get: function (target, name, receiver) {
        // https://github.com/nodejs/node/issues/10731
        // be careful about the initial symbol + string call when access the proxy(valueOf, util.inspect.custom, toStringTag)
        switch (name) {
          case "value":
            return function (v) {
              // now start execute all fns
              for (let i = 0, len = target.fns.length; i < len; i++) {
                let fn = target.fns[i];
                let args = fn.args ? fn.args : [];
                if (i > 0 || arguments.length !== 0) args.unshift(v);
                v = fn.fn.apply(fn.thisArg, args);
              }
              return v;
            }
          case "def":
            return function () {
              return JSON.stringify(target.fns.map(fn => {
                return { name: fn.fn.name, args: fn.args };
              }));
            }
          default:
            // no support on symbol yet
            // if (typeof name === "symbol") return;

            // preserved words
            // if (["inspect", "constructor", "prototype", "valueOf", "toString", "name"].indexOf(name) > -1) return;
            if (!obj.hasOwnProperty(name)) return receiver;

            let fn = typeof obj[name] === "function" ? obj[name] : function () { return obj[name]; };
            Object.defineProperty(fn, "name", { writable: true });
            fn.name = name;

            // return a ChainInstance with previous functions
            target.fns = target.fns || [];
            target.fns.push({ fn });
            target.fn = fn;
            return new ChainInstance(target, "get");
        }
      }
    });
  };

  // every methods inside of the obj should also be accessible after convert to chainable one
  return new Proxy(storage, {
    get: function (target, name) {
      // https://github.com/nodejs/node/issues/10731
      // be careful about the initial symbol + string call when access the proxy(valueOf, util.inspect.custom, toStringTag)
      if (!obj.hasOwnProperty(name)) return new ChainInstance(target);

      let fn = typeof obj[name] === "function" ? obj[name] : function () { return obj[name]; };
      Object.defineProperty(fn, "name", { writable: true });
      fn.name = name;

      // return a ChainInstance with previous functions
      let store = function () { };
      store.fns = target.fns || [];
      store.fns.push({ fn });
      store.fn = fn;

      return new ChainInstance(store, "get");
    }
  });
}

module.exports = Chainable;