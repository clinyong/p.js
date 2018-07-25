const { Promise, noop } = require("./Promise");
const { doResolve, doReject } = require("./utils");
const { isFunction } = require("./is");
const { QueueItem, execThen } = require("./QueueItem");
const { PENDING, FULFILLED, REJECTED } = require("./constants");

// 把 Promise 的一些实现放到这个文件，是因为在 is.js 中有个 isPromise 方法，这样做可以防止模块之间的循环依赖

Promise.prototype.then = function then(onFulfilled, onRejected) {
  // 还不知道从规范哪一条有说明这种情况
  // 不过如果不加的话，没办法通过 2.2.1，applied to a promise rejected and then chained off of
  if (
    (!isFunction(onFulfilled) && this.state === FULFILLED) ||
    (!isFunction(onRejected) && this.state === REJECTED)
  ) {
    return this;
  }

  const p = new this.constructor(noop);
  if (this.state === PENDING) {
    this.queue.push(new QueueItem(p, onFulfilled, onRejected));
  } else {
    // 需要判断这个 promise 是不是 pending，不是的话，马上执行 then 的内容
    // 解决 2.2.4 里面的 when one `onFulfilled` is added inside another `onFulfilled`

    const isFulfilled = this.state === FULFILLED;
    const func = isFulfilled ? onFulfilled : onRejected;

    execThen(p, func, this.value);
  }

  return p;
};

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

// 调用这个方法之后，promise 马上处于 fulfilled 状态，所以 doResolve 要是同步的
Promise.resolve = function resolve(value) {
  const p = new this(noop);
  doResolve(p, value);
  return p;
};

// 调用这个方法之后，promise 马上处于 rejected 状态
Promise.reject = function reject(reason) {
  const p = new this(noop);
  doReject(p, reason);
  return p;
};

exports.Promise = Promise;
