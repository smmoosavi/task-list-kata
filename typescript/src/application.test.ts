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
    expect(output.endsWith('\n> ')).toBe(true);
    return output.slice(0, -3); // Remove the trailing '> '
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
    ctx.expectOutput(['secrets', '    [ ] 1: Eat more donuts.', '    [ ] 2: Destroy all humans.']);

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

      'training',
      '    [x] 3: Four Elements of Simple Design',
      '    [ ] 4: SOLID',
      '    [x] 5: Coupling and Cohesion',
      '    [x] 6: Primitive Obsession',
      '    [ ] 7: Outside-In TDD',
      '    [ ] 8: Interaction-Driven Design',
    ]);
    ctx.sendCommand('quit');
  });
});
