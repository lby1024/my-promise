import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import Promise from "./src/index";

chai.use(sinonChai);
const assert = chai.assert;

describe("Promise", () => {
  it("测试resolve", (done) => {
    new Promise((resolve) => {
      setTimeout(() => resolve(200));
    }).then((data) => {
      assert(data === 200);
      done();
    });
  });

  it("测试reject", (done) => {
    new Promise((resolve, reject) => {
      setTimeout(() => reject(404));
    }).then(null, (data) => {
      assert(data === 404);
      done();
    });
  });

  it("多次执行 resolve()", (done) => {
    const fn = sinon.fake();
    new Promise((resolve) => {
      resolve(200);
      resolve(201);
      resolve(202);
    }).then(fn);
    setTimeout(() => {
      assert(fn.calledOnce);
      assert(fn.calledWith(200));
      done();
    });
  });

  it("多次执行 reject()", (done) => {
    const fn = sinon.fake();
    new Promise((resolve, reject) => {
      reject(404);
      reject(405);
      reject(406);
    }).then(null, fn);
    setTimeout(() => {
      assert(fn.calledOnce);
      assert(fn.calledWith(404));
      done();
    });
  });

  it("then 多次调用, 使用 resolve 触发", (done) => {
    const p = new Promise((resolve) => resolve());
    const callbacks = [sinon.fake(), sinon.fake()];
    p.then(callbacks[0]);
    p.then(callbacks[1]);
    setTimeout(() => {
      assert(callbacks[0].called);
      assert(callbacks[1].called);
      assert(callbacks[1].calledAfter(callbacks[0]));
      done();
    });
  });

  it("then 多次调用, 使用 reject 触发", (done) => {
    const p = new Promise((resolve, reject) => reject());
    const callbacks = [sinon.fake(), sinon.fake()];
    p.then(null, callbacks[0]);
    p.then(null, callbacks[1]);
    setTimeout(() => {
      assert(callbacks[0].called);
      assert(callbacks[1].called);
      assert(callbacks[1].calledAfter(callbacks[0]));
      done();
    });
  });

  it("执行then()返回一个promise对象", () => {
    const t = new Promise(() => {}).then();
    assert(t instanceof Promise);
  });

  it("链式调用, then(fn), fn返回一个字符串", (done) => {
    const promise = new Promise((resolve) => resolve());
    promise
      .then(() => "成功")
      .then((result) => {
        assert.equal(result, "成功");
        done();
      });
  });

  it("链式调用, then(null, fn), fn返回一个字符串", (done) => {
    const promise = new Promise((resolve, reject) => reject());
    promise
      .then(null, () => "成功")
      .then((result) => {
        assert.equal(result, "成功");
        done();
      });
  });

  it("链式调用, then(fn), fn返回一个 resolve 的 promise", (done) => {
    new Promise((resolve) => resolve())
      .then(() => new Promise((resolve) => resolve(1)))
      .then((res) => {
        assert(res === 1);
        done();
      });
  });

  it("链式调用, then(fn), fn返回一个 reject 的 promise", (done) => {
    new Promise((resolve) => resolve())
      .then(() => new Promise((resolve, reject) => reject(1)))
      .then(null, (res) => {
        assert(res === 1);
        done();
      });
  });

  it("链式调用, then(null, fn), fn返回一个 resolve 的 promise", (done) => {
    new Promise((resolve, reject) => reject())
      .then(null, () => new Promise((resolve) => resolve(1)))
      .then((res) => {
        assert(res === 1);
        done();
      });
  });

  it("链式调用, then(null, fn), fn返回一个 reject 的 promise", (done) => {
    new Promise((resolve, reject) => reject())
      .then(null, () => new Promise((resolve, reject) => reject(1)))
      .then(null, (res) => {
        assert(res === 1);
        done();
      });
  });
});
