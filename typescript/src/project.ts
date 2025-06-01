import type { Task } from './task';

export class Project {
  tasks: Task[] = [];
  constructor(public name: string) {}

  addTask(task: Task) {
    this.tasks.push(task);
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  forEachTask(func: (task: Task) => void) {
    for (const task of this.tasks) {
      func(task);
    }
  }
}
