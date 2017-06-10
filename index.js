/**
 * Convert any object into a chainable instance, which will support methods belonged to original object to be used as chain methods.
 * 
 * Basically, always pass value along the methods chain as the first parameter, and always return a valid chainable instance for get or function call.
 * 
 */

const chainable = function (obj) {
  // will return an chainable object
  const co = {};
  co._chain = {};
  co._obj = obj;

  // this is the instance returned when call with chained[prop]
  let ChainInstance = function (method, value) {
    let fn = function(...args) {
      if (fn._value) {
        fn._value = method.bind(this, fn._value).apply(this, args);
      } else {
        fn._value = method.apply(this, args);
      }
      return fn;
    }

    if (value) fn._value = value;

    let setPrototypeOf = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? function (obj, proto) {
      obj.__proto__ = proto;
    } : function (obj, proto) {
      Object.keys(proto).forEach(name => obj[name] = proto[name]);
    });

    // the chainable object has all methods defined
    // so the returned obj still have the access to other methods
    // handle the value passed along
    setPrototypeOf(fn, co._chain);

    // retrieve fn
    fn.value = function() {
      return fn._value;
    };

    return fn;
  }

  // preserved method names
  co.register = function (name, fn) {
    if (typeof name === "object") {
      Object.keys(name).forEach(n => co.register(n, name[n]));
    } else if (typeof name === "string" && typeof fn === "function") {
      // attach a method with same name to this
      // preserve the parameter
      Object.defineProperty(co, name, {
        get() {
          // should return a new instance
          // and the instance need to have access to all other methods -> prototype
          return new ChainInstance(fn);
        }
      });

      Object.defineProperty(co._chain, name, {
        get() {
          // should return a new instance
          // and the instance need to have access to all other methods -> prototype
          return new ChainInstance(fn, this._value);
        }
      });
    }
  }

  // make every property a method
  for (let prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue;

    let method = obj[prop];

    // convert properties into functions that return the property value
    if (typeof method !== "function") {
      method = function () {
        return obj[prop];
      }
    }

    co.register(prop, method);
  }

  // finally return
  return co;
}

module.exports = chainable;