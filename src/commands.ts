import { Selector } from "./game-types";

export class ExecuteCommand {
  command = "execute";

  toString(): string {
    return this.command;
  }

  as(selector: Selector): ExecuteCommand {
    this.command = `${this.command} as ${selector}`;
    return this;
  }
  at(selector: Selector): ExecuteCommand {
    this.command = `${this.command} at ${selector}`;
    return this;
  }

  if(conditions: string): ExecuteCommand {
    this.command = `${this.command} if ${conditions}`;
    return this;
  }
  unless(conditions: string): ExecuteCommand {
    this.command = `${this.command} unless ${conditions}`;
    return this;
  }

  facing = (args: string): ExecuteCommand => {
    this.command = `${this.command} facing ${args}`;
    return this;
  };

  positioned = this.facing;

  run(command: string): ExecuteCommand {
    this.command = `${this.command} run ${command}`;
    return this;
  }
}

export const execute = (): ExecuteCommand => new ExecuteCommand();
