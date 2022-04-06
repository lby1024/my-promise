import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import Promise from "./src/index";

chai.use(sinonChai);
const assert = chai.assert;

describe("promise 测试", () => {
  it("then resolve", (done) => {
    new Promise((resolve) => resolve(1)).then((res) => {
      assert(res === 1);
      done();
    });
  });
  it("then reject", (done) => {
    new Promise((s, j) => j(1)).then(null, (res) => {
      assert(res === 1);
      done();
    });
  });
  it("then 多次调用 resolve", (done) => {
    let result = 0;
    new Promise((resolve) => {
      resolve(1);
      resolve(2);
      resolve(3);
    }).then((res) => (result = res));
    setTimeout(() => {
      assert(result === 1);
      done();
    });
  });
  it("then 多次调用", (done) => {
    let result = "";
    let p = new Promise((resolve) => resolve(1));
    p.then(() => (result += "a"));
    p.then(null, () => (result += "b"));
    p.then(() => (result += "c"));
    setTimeout(() => {
      assert(result === "ac");
      done();
    });
  });
  it("then 链式调用", (done) => {
    new Promise((s, j) => j("a"))
      .then(null, (res) => res + "b")
      .then((res) => res + "c")
      .then((res) => {
        return new Promise((resolve) => resolve(res + "d"));
      })
      .then((res) => new Promise((s, j) => j(res + "e")))
      .then(null, (reason) => {
        assert(reason === "abcde");
        done();
      });
  });
  it("then 透传", (done) => {
    new Promise((s, j) => j("aaa"))
      .then((res) => "xxx")
      .then(null, (err) => {
        assert(err === "aaa");
        done();
      });
  });
  it("catch", (done) => {
    new Promise((s, j) => j("a"))
      .then(() => "xxx")
      .catch((err) => err + "b")
      .then((res) => res + "c")
      .then((res) => {
        return new Promise((resolve) => resolve(res + "d"));
      })
      .then((res) => new Promise((s, j) => j(res + "e")))
      .catch((err) => {
        assert(err === "abcde");
        done();
      });
  });
  it("静态方法 resolve", (done) => {
    Promise.resolve(1).then((res) => {
      assert(res === 1);
      done();
    });
  });
  it("静态方法 reject", (done) => {
    Promise.reject(1).then(null, (reason) => {
      assert(reason === 1);
      done();
    });
  });
  it("静态方法 race resolve", (done) => {
    const p1 = new Promise((resolve) => resolve(1));
    const p2 = new Promise((resolve) => {
      setTimeout(() => resolve(2), 10);
    });
    Promise.race([p1, p2]).then((res) => {
      assert(res === 1);
      done();
    });
  });
  it("静态方法 race reject", (done) => {
    const p1 = new Promise((resolve, reject) => reject(1));
    const p2 = new Promise((resolve) => {
      setTimeout(() => resolve(2), 10);
    });
    Promise.race([p1, p2]).then(null, (res) => {
      assert(res === 1);
      done();
    });
  });
  it("静态方法 all resolve", (done) => {
    const p1 = new Promise((resolve) => resolve(1));
    const p2 = new Promise((resolve) => {
      setTimeout(() => resolve(2), 10);
    });
    Promise.all([p1, p2]).then((res) => {
      expect([1, 2]).toEqual(res);
      done();
    });
  });
  it("静态方法 all reject", (done) => {
    const p1 = new Promise((resolve) => resolve(1));
    const p2 = new Promise((s, j) => j(2));
    Promise.all([p1, p2]).then(null, (res) => {
      assert(res === 2);
      done();
    });
  });
});
