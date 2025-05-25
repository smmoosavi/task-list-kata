import type { Task } from './task';

export class Project {
  constructor(
    private _name: string,
    private _tasks: Task[] = [],
  ) {}

  addTask(task: Task) {
    this._tasks.push(task);
  }

  getTasks(): Task[] {
    return this._tasks;
  }
  getName(): string {
    return this._name;
  }
  getTaskById(taskId: number): Task | undefined {
    return this._tasks.find((task) => task.id === taskId);
  }
}
