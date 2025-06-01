export class Task {
  constructor(
    private _id: number,
    private _description: string,
    private _done: boolean,
  ) {}

  get id() {
    return this._id;
  }

  set done(val: boolean) {
    this._done = val;
  }

  toString(): string {
    return `${this._done ? '[x]' : '[ ]'} ${this._id}: ${this._description}`;
  }
}
