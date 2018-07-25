const { Promise } = require("./Promise");

function toString(o) {
  return Object.prototype.toString.call(o);
}
function isFunction(func) {
  return typeof func === "function";
}
function isObject(obj) {
  return toString(obj) === "[object Object]";
}
function isPromise(p) {
  return p instanceof Promise;
}

exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isPromise = isPromise;
