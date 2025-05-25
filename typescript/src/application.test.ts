import { PassThrough } from 'stream';
import { describe, test, expect } from 'vitest';
import { TaskList } from '../src/task_list';

class TestContext {
  input = new PassThrough();
  output = new PassThrough();
  expectations: (() => boolean)[] = [];
  tl = new TaskList(this.input, this.output);

  async run() {
    this.tl.run();

    for (const expectation of this.expectations) {
      await new Promise<void>((resolve) =>
        this.output.once('readable', () => {
          if (expectation()) resolve();
        }),
      );
    }

    this.input.end();
    this.output.end();
  }

  expectOutput(lines: string[]) {
    let text = lines.join('\n') + '\n';
    this.expectations.push(() => {
      const data = this.output.read(text.length)?.toString();
      expect(data).toBe(text);
      return !!data;
    });
  }

  sendCommand(command: string) {
    this.expectations.push(() => {
      const prompt = this.output.read(2)?.toString();
      expect(prompt).toBe('> ');
      this.input.write(`${command}\n`);
      return !!prompt;
    });
  }
}

describe('TaskList Application', () => {
  test('full interaction test', async () => {
    const ctx = new TestContext();

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

    await ctx.run();
  });
});
