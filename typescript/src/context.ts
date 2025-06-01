import type { Interface } from 'readline';
import type { Project } from './project';
import type { Task } from './task';

export class Context {
  constructor(
    public output: Output,
    public store: Store,
  ) {}
}

export class Output {
  constructor(private readline: Interface) {}

  println(ln: string) {
    // @ts-ignore
    this.readline.output.write(ln);
    // @ts-ignore
    this.readline.output.write('\n');
  }
}

export class Store {
  private projects: Project[];
  private lastId: number = 0;
  constructor() {
    this.projects = [];
  }
  nextId(): number {
    return ++this.lastId;
  }
  forEachProject(func: (project: Project) => any) {
    for (const project of this.projects) {
      func(project);
    }
  }
  addProject(project: Project) {
    this.projects.push(project);
  }
  getProjectByName(name: string): Project | undefined {
    return this.projects.find((p) => p.name === name);
  }
  getTaskById(id: number): Task | undefined {
    for (const project of this.projects) {
      const task = project.getTaskById(id);
      if (task) {
        return task;
      }
    }
    return undefined;
  }
}
