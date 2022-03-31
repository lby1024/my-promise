type Callback = null | undefined | ((data: any) => any);
type State = "pending" | "success" | "fail";
type Fn = (resolve: Promise2["resolve"], reject: Promise2["reject"]) => any;

export default class Promise2 {
  state: State = "pending";
  queue: [Callback, Callback, Promise2][] = [];

  constructor(fn: Fn) {
    fn.call(undefined, this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(data: any) {
    this.sOrJ("success", data);
  }

  reject(data: any) {
    this.sOrJ("fail", data);
  }

  then(onresolve: Callback, onreject: Callback) {
    const p = new Promise2(() => {});
    this.queue.push([onresolve, onreject, p]);
    return p;
  }

  sOrJ(state: State, data: any) {
    setTimeout(() => {
      if (this.state !== "pending") return;
      this.state = state;
      const index = state === "success" ? 0 : 1;
      this.queue.forEach((item) => {
        if (!item[index]) return;
        const x = item[index]?.call(undefined, data);
        this.resolveX(x, item[2]);
      });
    });
  }

  resolveX(x: any, p: Promise2) {
    if (x instanceof Promise2) {
      x.then(
        (res) => p.resolve(res),
        (reason) => p.reject(reason)
      );
      return;
    }
    p.resolve(x);
  }
}
