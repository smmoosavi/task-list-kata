import * as readline from 'readline';

import { Output, Store, Context } from './context';
import { CommandFactory } from './command';

export class TaskList {
  static QUIT = 'quit';
  private readline;
  private ctx: Context;

  constructor(reader: NodeJS.ReadableStream, writer: NodeJS.WritableStream) {
    this.readline = readline.createInterface({
      terminal: false,
      input: reader,
      output: writer,
    });

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
    this.ctx = new Context(new Store(), new Output(this.readline));
  }

  run() {
    this.readline.prompt();
  }

  execute(commandLine: string) {
    CommandFactory.parse(commandLine).execute(this.ctx);
  }
}
