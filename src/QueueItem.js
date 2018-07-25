const { doResolve, doReject } = require("./utils");
const { isFunction, isPromise, isObject } = require("./is");

function processNestedThen(promise, x, then) {
  // 如果有 resolve 或者 reject 之后，忽略再次调用
  let called = false;

  function resolvePromise(y) {
    if (!called) {
      promiseResolutionProcedure(promise, y);
      called = true;
    }
  }

  function rejectPromise(reason) {
    if (!called) {
      doReject(promise, reason);
      called = true;
    }
  }

  try {
    then.call(x, resolvePromise, rejectPromise);
  } catch (e) {
    if (!called) {
      doReject(promise, e);
    }
  }
}

// 这里是 2.3 The Promise Resolution Procedure
function promiseResolutionProcedure(promise, returnValue) {
  if (returnValue === promise) {
    doReject(promise, new TypeError("Cannot resolve promise with itself"));
  } else if (isPromise(returnValue)) {
    // 2.3.2 if x is a promise, adopt its state
    processNestedThen(promise, returnValue, returnValue.then);
  } else if (isFunction(returnValue) || isObject(returnValue)) {
    let then;

    try {
      then = returnValue.then;
    } catch (e) {
      /*
      * 这里取 then 的时候是有可能出错
      * 2.3.3 中的 2.3.3.2
      *
      * 比如 returnValue 的值为
      * Object.create(Object.prototype, {
      *  then: {
      *    get: function() {
      *      throw e;
      *    }
      *  }
      * });
      */

      doReject(promise, e);
      return;
    }

    if (isFunction(then)) {
      processNestedThen(promise, returnValue, then);
    } else {
      doResolve(promise, returnValue);
    }
  } else {
    doResolve(promise, returnValue);
  }
}

function execThen(promise, func, value) {
  process.nextTick(function() {
    let returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      doReject(promise, e);
      return;
    }
    promiseResolutionProcedure(promise, returnValue);
  });
}

function QueueItem(promise, onFulfilled, onRejected) {
  function defaultResolve(value) {
    doResolve(promise, value);
  }
  function defaultReject(reason) {
    doReject(promise, reason);
  }
  function wrap(func) {
    return function(value) {
      execThen(promise, func, value);
    };
  }

  this.promise = promise;

  // 默认的 resolve 和 reject 不能用 noop，因为这个 promise 上面虽然没有注册 onFulfilled 和 onRejected，但是也有可能被 then
  // 比如 const p2 = p1.then(null, null); const p3 = p2.then(...); 如果是 noop 的话，p1 fulfilled 或者 rejected，就不会通知到 p3
  this.callFulfilled = isFunction(onFulfilled)
    ? wrap(onFulfilled)
    : defaultResolve;
  this.callRejected = isFunction(onRejected) ? wrap(onRejected) : defaultReject;
}

exports.QueueItem = QueueItem;
exports.execThen = execThen;
