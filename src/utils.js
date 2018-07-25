const { REJECTED, FULFILLED } = require("./constants");

function doReject(promise, error) {
  promise.state = REJECTED;
  // 需要存储这个 value，因为当 promise 是非 pending 的状态的时候，可以拿来 reject
  promise.value = error;
  promise.queue.forEach(function(queueItem) {
    queueItem.callRejected(error);
  });
}

function doResolve(promise, value) {
  promise.state = FULFILLED;
  // 需要存储这个 value，因为当 promise 是非 pending 的状态的时候，可以拿来 resolve
  promise.value = value;
  promise.queue.forEach(function(queueItem) {
    queueItem.callFulfilled(value);
  });
}

exports.doReject = doReject;
exports.doResolve = doResolve;
