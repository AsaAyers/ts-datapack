import { Selector } from "./game-types";
import { Objective, McFunction, CodeGenerator, CodeGenReturn } from "./types";

export function command(...args: string[]): string {
  return args.join(" ");
}

type NBTData = Record<string, any>;
export function nbt(data: NBTData): string {
  return JSON.stringify(data);
}

export class ExecuteCommand {
  command = "execute";

  public type = "execute";

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

  positioned = (args: string): ExecuteCommand => {
    this.command = `${this.command} positioned ${args}`;
    return this;
  };

  // I had to add CodeGenerator for functions that reference themselves. By
  // runtime `mcFunction` will have transformed it to an McFunction
  run(command: Command | McFunction | CodeGenerator): ExecuteCommand {
    // If you just pass an McFunciton directly, this assumes you want to run it
    // with the `function` command. since funciton is a keyword in JS, I can't
    // make a function(fn: McFunction): string
    if (typeof command === "function") {
      return this.run(`function ${command}`);
    }

    this.command = `${this.command} run ${command}`;
    return this;
  }
}

export const execute = (): ExecuteCommand => new ExecuteCommand();

/*
    scoreboard players (add|enable|get|list|operation|remove|reset|set)

        ... add <targets> <objective> <score>
        ... enable <targets> <objective>
        ... get <target> <objective>
        ... list [<target>]
        ... operation <targets> <targetObjective> <operation> <source> <sourceObjective>
        ... remove <targets> <objective> <score>
        ... reset <targets> [<objective>]
        ... set <targets> <objective> <score>
*/

export function scoreboard(
  type: "players",
  X: "enable",
  targets: Selector,
  objective: Objective
): string;
export function scoreboard(
  type: "players",
  X: "add" | "set",
  targets: Selector,
  objective: Objective,
  score: number
): string;
export function scoreboard(
  type: "players",
  X: "operation",
  targets: Selector,
  targetObjective: Objective,
  operation: "+=" | "-=" | "*=" | "/=" | "%=" | "=" | "<" | ">" | "><",
  source: Selector,
  sourceObjective: Objective
): string;

export function scoreboard(...args: unknown[]): string {
  return `scoreboard ${args.join(" ")}`;
}

export function say(text: string): string {
  return `say "${text}"`;
}

type Command = string | ExecuteCommand;

export function tellraw(selector: Selector, data: NBTData): string {
  return `tellraw ${selector} ${nbt(data)}`;
}

// effect give <entity> <effect> [<seconds>] [<amplifier>] [<hideParticles>]
// effect clear <entity> [<effect>]

type Effect =
  | "minecraft:glowing"
  | "minecraft:regeneration"
  | "minecraft:resistance";

export function effect(op: "clear", entity: Selector, effect?: Effect): string;
export function effect(
  op: "give",
  entity: Selector,
  effect: Effect,
  seconds?: number,
  amplifier?: number,
  hideParticles?: boolean
): string;
export function effect(...args: unknown[]): string {
  return `effect ${args.join(" ")}`;
}

export function schedule(
  fn: McFunction | CodeGenerator,
  time: number | string,
  append?: boolean
): string;
export function schedule(
  clear: "clear",
  fn: McFunction | CodeGenerator
): string;
export function schedule(...args: unknown[]): string {
  if (args[0] === "clear") {
    return `schedule clear ${args[1]}`;
  } else {
    const [fn, time, append = false] = args;

    return `schedule function ${fn} ${time} ${append ? "append" : "replace"}`;
  }
}

export function team(op: "add", team: string, displayName?: string): string;
export function team(op: "empty", team: string): string;
export function team(op: "join", team: string, members: Selector): string;
export function team(op: "leave", members: Selector): string;
export function team(op: "list", team: string): string;
export function team(
  op: "modify",
  team: string,
  option: string,
  value: string
): string;
export function team(op: "remove", team: string): string;
export function team(...args: unknown[]): string {
  return `team ${args.join(" ")}`;
}
