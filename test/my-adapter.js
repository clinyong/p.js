const { Promise } = require("../src");

exports.deferred = function deferred() {
  const pending = {};

  pending.promise = new Promise(function(resolve, reject) {
    pending.resolve = resolve;
    pending.reject = reject;
  });

  return pending;
};

exports.resolved = function(value) {
  return Promise.resolve(value);
};

exports.rejected = function(reason) {
  return Promise.reject(reason);
};
