const { doResolve, doReject } = require("./utils");
const { PENDING } = require("./constants");

function noop() {}

function Promise(executor) {
  this.queue = [];
  this.state = PENDING;

  function resolve(value) {
    doResolve(this, value);
  }
  function reject(error) {
    doReject(this, error);
  }

  if (executor !== noop) {
    try {
      executor(resolve.bind(this), reject.bind(this));
    } catch (e) {
      reject(e);
    }
  }
}

exports.Promise = Promise;
exports.noop = noop;
