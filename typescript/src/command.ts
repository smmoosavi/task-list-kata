import type { Context } from './context';
import { Project } from './project';
import { takeUntilWhitespace } from './string-utils';
import { Task } from './task';

interface Command {
  execute(ctx: Context): void;
}

export class CommandFactory {
  static parse(line: string): Command {
    line = line.trim();
    let [command, rest] = takeUntilWhitespace(line);
    if (command === 'show') {
      return new ShowCommand(rest);
    }
    if (line.startsWith('add ')) {
      let [ty, tyRest] = takeUntilWhitespace(rest);
      if (ty === 'project') {
        return new AddProjectCommand(tyRest);
      }
      if (ty === 'task') {
        return new AddTaskCommand(tyRest);
      }
    }
    if (command === 'check') {
      return new SetDoneCommand(rest, true);
    }
    if (command === 'uncheck') {
      return new SetDoneCommand(rest, false);
    }
    if (command === 'help') {
      return new HelpCommand(rest);
    }
    return new NotFoundCommand(line);
  }
}

class ShowCommand implements Command {
  constructor(rest: string) {}

  execute(ctx: Context) {
    let projects = ctx.store.getProjects();
    for (const project of projects) {
      ctx.output.println(`${project.getName()}`);
      const tasks = project.getTasks();
      for (const task of tasks) {
        ctx.output.println(`    ${task.toString()}`);
      }
    }
  }
}

class AddProjectCommand implements Command {
  private projectName: string;
  constructor(rest: string) {
    this.projectName = rest.trim();
  }
  execute(ctx: Context) {
    const project = new Project(this.projectName);
    ctx.store.addProject(project);
  }
}

class AddTaskCommand implements Command {
  private projectName: string;
  private description: string;
  constructor(rest: string) {
    const [projectName, description] = takeUntilWhitespace(rest);
    this.projectName = projectName;
    this.description = description;
  }

  execute(ctx: Context) {
    const project = ctx.store.getProjectByName(this.projectName);
    if (!project) {
      ctx.output.println(`Could not find a project with the name \"${this.projectName}\".`);
      return;
    }

    const task = new Task(ctx.store.nextId(), this.description, false);
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

  execute(ctx: Context) {
    let task = ctx.store.getTaskById(this.id);
    if (!task) {
      ctx.output.println(`Could not find a task with an ID of ${this.id}.`);
      return;
    }
    task.done = this.done;
  }
}

class HelpCommand implements Command {
  constructor(private rest: string) {}
  execute(ctx: Context) {
    ctx.output.println('Commands:');
    ctx.output.println('  show');
    ctx.output.println('  add project <project name>');
    ctx.output.println('  add task <project name> <task description>');
    ctx.output.println('  check <task ID>');
    ctx.output.println('  uncheck <task ID>');
    ctx.output.println('');
  }
}

class NotFoundCommand implements Command {
  private command: string;
  constructor(line: string) {
    const [command] = takeUntilWhitespace(line);
    this.command = command;
  }

  execute(ctx: Context) {
    ctx.output.println(`I don't know what the command "${this.command}" is.`);
  }
}
