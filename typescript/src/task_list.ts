import * as readline from 'readline';

import * as task from './task';
import { Store, Context, Output } from './context';
import { parseCommand } from './command';

export class TaskList {
  static QUIT = 'quit';
  private readline;
  private context: Context;

  constructor(reader: NodeJS.ReadableStream, writer: NodeJS.WritableStream) {
    this.readline = readline.createInterface({
      terminal: false,
      input: reader,
      output: writer,
    });
    let output = new Output(this.readline);
    let store = new Store();
    this.context = new Context(output, store);

    this.readline.setPrompt('> ');
    this.readline.on('line', (cmd) => {
      if (cmd == TaskList.QUIT) {
        this.readline.close();
        return;
      }
      this.execute(cmd);
      this.readline.prompt();
    });
    this.readline.on('close', () => {
      writer.end();
    });
  }

  run() {
    this.readline.prompt();
  }

  execute(commandLine: string) {
    let command = parseCommand(commandLine);
    command.exec(this.context);
  }
}
