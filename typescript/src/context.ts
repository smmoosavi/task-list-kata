import type { Interface } from 'readline';
import { Task } from './task';
import type { Project } from './project';

export class Context {
  constructor(
    public store: Store,
    public output: Output,
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
  private projects: Project[] = [];
  private lastId = 0;

  addProject(project: Project) {
    this.projects.push(project);
  }
  getProjects(): Project[] {
    return this.projects;
  }
  getProjectByName(name: string): Project | undefined {
    return this.projects.find((project) => project.getName() === name);
  }

  getTaskById(taskId: number): Task | undefined {
    for (const project of this.projects) {
      const task = project.getTaskById(taskId);
      if (task) {
        return task;
      }
    }
  }

  nextId(): number {
    return ++this.lastId;
  }
}
