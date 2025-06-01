import { PassThrough } from 'stream';
import { describe, test, expect } from 'vitest';
import { TaskList } from '../src/task_list';

class TestContext {
  input = new PassThrough();
  output = new PassThrough();
  taskList = new TaskList(this.input, this.output);
  run() {
    this.taskList.run();
  }

  emptyOutput() {
    while (this.output.read()) {
      // Clear the output stream
    }
  }

  sendCommand(command: string) {
    this.emptyOutput();
    this.input.write(`${command}\n`);
  }

  getOutput() {
    let output = '';
    let chunk = this.output.read();
    if (chunk === null) {
      return null;
    }
    while (chunk !== null) {
      output += chunk.toString();
      chunk = this.output.read();
    }
    return output;
  }
  getOutputWithoutPrompt() {
    const output = this.getOutput();
    if (output === null) {
      return null;
    }
    // expect ends with '> ' and remove it
    if (output.endsWith('\n> ')) {
      return output.slice(0, -3);
    }
    if (output.endsWith('> ')) {
      return output.slice(0, -2);
    }
    throw new Error('expect output ends with `> `');
  }

  expectOutput(lines: string[]) {
    const output = this.getOutputWithoutPrompt();
    if (output === null) {
      throw new Error('Output is null');
    }
    const expectedOutput = lines.join('\n');
    expect(output).toBe(expectedOutput);
  }
}

describe('TaskList Application', () => {
  test('full interaction test', async () => {
    const ctx = new TestContext();

    ctx.run();

    ctx.sendCommand('show');

    ctx.sendCommand('add project secrets');
    ctx.sendCommand('add task secrets Eat more donuts.');
    ctx.sendCommand('add task secrets Destroy all humans.');

    ctx.sendCommand('show');
    ctx.expectOutput(['secrets', '    [ ] 1: Eat more donuts.', '    [ ] 2: Destroy all humans.', '']);

    ctx.sendCommand('add project training');
    ctx.sendCommand('add task training Four Elements of Simple Design');
    ctx.sendCommand('add task training SOLID');
    ctx.sendCommand('add task training Coupling and Cohesion');
    ctx.sendCommand('add task training Primitive Obsession');
    ctx.sendCommand('add task training Outside-In TDD');
    ctx.sendCommand('add task training Interaction-Driven Design');

    ctx.sendCommand('check 1');
    ctx.sendCommand('check 3');
    ctx.sendCommand('check 5');
    ctx.sendCommand('check 6');

    ctx.sendCommand('show');
    ctx.expectOutput([
      'secrets',
      '    [x] 1: Eat more donuts.',
      '    [ ] 2: Destroy all humans.',
      '',
      'training',
      '    [x] 3: Four Elements of Simple Design',
      '    [ ] 4: SOLID',
      '    [x] 5: Coupling and Cohesion',
      '    [x] 6: Primitive Obsession',
      '    [ ] 7: Outside-In TDD',
      '    [ ] 8: Interaction-Driven Design',
      '',
    ]);
    ctx.sendCommand('quit');
  });

  test('help command', async () => {
    const ctx = new TestContext();

    ctx.run();
    ctx.sendCommand('help');
    ctx.expectOutput([
      'Commands:',
      '  show',
      '  add project <project name>',
      '  add task <project name> <task description>',
      '  check <task ID>',
      '  uncheck <task ID>',
      '',
    ]);
  });

  test('invalid command', async () => {
    const ctx = new TestContext();

    ctx.run();
    ctx.sendCommand('invalid command');
    ctx.expectOutput([`I don't know what the command "invalid" is.`]);
  });

  test('no project', async () => {
    const ctx = new TestContext();

    ctx.run();
    ctx.sendCommand('show');
    ctx.expectOutput([]);
  });

  test('empty project', async () => {
    const ctx = new TestContext();

    ctx.run();
    ctx.sendCommand('add project foo');
    ctx.sendCommand('show');
    ctx.expectOutput(['foo', '']);
  });

  test('check/uncheck', async () => {
    const ctx = new TestContext();
    ctx.run();

    ctx.sendCommand('add project foo');
    ctx.sendCommand('add task foo Task 1');
    ctx.sendCommand('add task foo Task 2');
    ctx.sendCommand('check 1');
    ctx.sendCommand('show');
    ctx.expectOutput(['foo', '    [x] 1: Task 1', '    [ ] 2: Task 2', '']);
    ctx.sendCommand('uncheck 1');
    ctx.sendCommand('show');
    ctx.expectOutput(['foo', '    [ ] 1: Task 1', '    [ ] 2: Task 2', '']);
  });

  test('not existing project', () => {
    const ctx = new TestContext();
    ctx.run();

    ctx.sendCommand('add task foo Task 1');
    ctx.expectOutput([`Could not find a project with the name "foo".`]);
  });

  test('check not existing task', () => {
    const ctx = new TestContext();
    ctx.run();

    ctx.sendCommand('check 1');
    ctx.expectOutput(['Could not find a task with an ID of 1.']);
  });
});
