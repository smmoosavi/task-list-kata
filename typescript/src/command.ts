import type { Context } from './context';
import { Project } from './project';
import { takeOne } from './str-utils';
import { Task } from './task';

export interface Command {
  exec(ctx: Context): void;
}

export function parseCommand(str: string): Command {
  let [cmd, rest] = takeOne(str);
  switch (cmd) {
    case 'show': {
      return new ShowCommand(rest);
    }
    case 'add': {
      let [ty, tyRest] = takeOne(rest);
      switch (ty) {
        case 'project': {
          return new AddProjectCommand(tyRest);
        }
        case 'task': {
          return new AddTaskCommand(tyRest);
        }
      }
    }
    case 'check': {
      return new SetDoneCommand(rest, true);
    }
    case 'uncheck': {
      return new SetDoneCommand(rest, false);
    }
    case 'help': {
      return new HelpCommand();
    }
  }
  return new ErrorCommand(cmd, rest);
}

class ShowCommand implements Command {
  constructor(rest: string) {}
  exec(ctx: Context): void {
    ctx.store.forEachProject((project) => {
      ctx.output.println(`${project.name}`);
      project.forEachTask((task) => {
        ctx.output.println(`    ${task.toString()}`);
      });
      ctx.output.println('');
    });
  }
}

class AddProjectCommand implements Command {
  constructor(private name: string) {}
  exec(ctx: Context): void {
    let project = new Project(this.name);
    ctx.store.addProject(project);
  }
}

class AddTaskCommand implements Command {
  private projectName: string;
  private description: string;
  constructor(rest: string) {
    let [projectName, description] = takeOne(rest);
    this.projectName = projectName;
    this.description = description;
  }
  exec(ctx: Context): void {
    let project = ctx.store.getProjectByName(this.projectName);
    if (!project) {
      ctx.output.println(`Could not find a project with the name "${this.projectName}".`);
      return;
    }
    let id = ctx.store.nextId();
    let task = new Task(id, this.description, false);
    project.addTask(task);
  }
}

class SetDoneCommand implements Command {
  private id: number;
  constructor(
    rest: string,
    private done: boolean,
  ) {
    this.id = parseInt(rest, 10);
  }
  exec(ctx: Context): void {
    let task = ctx.store.getTaskById(this.id);
    if (!task) {
      ctx.output.println(`Could not find a task with an ID of ${this.id}.`);
      return;
    }
    task.done = this.done;
  }
}

class HelpCommand implements Command {
  exec(ctx: Context): void {
    ctx.output.println('Commands:');
    ctx.output.println('  show');
    ctx.output.println('  add project <project name>');
    ctx.output.println('  add task <project name> <task description>');
    ctx.output.println('  check <task ID>');
    ctx.output.println('  uncheck <task ID>');
    ctx.output.println('');
  }
}

class ErrorCommand implements Command {
  constructor(
    private cmd: string,
    private rest: string,
  ) {}
  exec(ctx: Context): void {
    ctx.output.println('I don\'t know what the command "' + this.cmd + '" is.');
  }
}
