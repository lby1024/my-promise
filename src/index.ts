type State = "pending" | "success" | "fail";
type CB = null | undefined | ((data?: any) => any);
type Fn = (resolve: Promise2["resolve"], reject: Promise2["reject"]) => any;

export default class Promise2 {
  queue: [CB, CB, Promise2][] = [];
  state: State = "pending";

  constructor(fn: Fn) {
    fn.call(undefined, this.resolve.bind(this), this.reject.bind(this));
  }

  resolveOrReject(state: State, data: any) {
    setTimeout(() => {
      if (this.state !== "pending") return;
      this.state = state;
      const index = state === "success" ? 0 : 1;
      this.queue.forEach((item) => {
        if (item[index] instanceof Function) {
          const x = item[index]?.call(undefined, data);
          item[2].resolveX(x);
        } else {
          if (state === "success") item[2].resolve(data);
          if (state === "fail") item[2].reject(data);
        }
      });
    });
  }

  resolveX(x: any) {
    if (x instanceof Promise2) {
      x.then(
        (res) => this.resolve(res),
        (reason) => this.reject(reason)
      );
      return;
    }
    this.resolve(x);
  }

  resolve(data: any) {
    this.resolveOrReject("success", data);
  }

  reject(data: any) {
    this.resolveOrReject("fail", data);
  }

  then(onResolve?: CB, onReject?: CB) {
    const p = new Promise2(() => {});
    this.queue.push([onResolve, onReject, p]);
    return p;
  }

  catch(onReject?: CB) {
    return this.then(null, onReject);
  }

  static resolve(data: any) {
    return new Promise2((resolve) => resolve(data));
  }

  static reject(data: any) {
    return new Promise2((resolve, reject) => reject(data));
  }

  static race(arr: Promise2[]) {
    return new Promise2((resolve, reject) => {
      arr.forEach((p) =>
        p.then(
          (res) => resolve(res),
          (reason) => reject(reason)
        )
      );
    });
  }

  static all(arr: Promise2[]) {
    return new Promise2((resolve, reject) => {
      let resArr: Promise2[] = [];
      arr.forEach((p) => {
        p.then(
          (res) => {
            resArr.push(res);
            if (resArr.length === arr.length) resolve(resArr);
          },
          (reason) => reject(reason)
        );
      });
    });
  }
}
