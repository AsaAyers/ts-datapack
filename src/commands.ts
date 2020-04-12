import { Selector, Location } from "./game-types";
import { Objective, McFunction, CodeGenerator, Command } from "./types";

export function command(...args: string[]): Command {
  return {
    type: "command",
    toString(): string {
      return args.join(" ").trim();
    },
  };
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
  run(cmd: Command | McFunction | CodeGenerator): ExecuteCommand {
    // If you just pass an McFunciton directly, this assumes you want to run it
    // with the `function` command. since funciton is a keyword in JS, I can't
    // make a function(fn: McFunction): string
    if (typeof cmd === "function") {
      return this.run(command(`function ${cmd}`));
    }

    this.command = `${this.command} run ${cmd}`;
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
): Command;
export function scoreboard(
  type: "players",
  X: "add" | "set",
  targets: Selector,
  objective: Objective,
  score: number
): Command;
export function scoreboard(
  type: "players",
  X: "operation",
  targets: Selector,
  targetObjective: Objective,
  operation: "+=" | "-=" | "*=" | "/=" | "%=" | "=" | "<" | ">" | "><",
  source: Selector,
  sourceObjective: Objective
): Command;

export function scoreboard(...args: unknown[]): Command {
  return command(`scoreboard ${args.join(" ")}`);
}

export function say(text: string): Command {
  return command(`say "${text}"`);
}

export function tellraw(selector: Selector, data: NBTData): Command {
  return command(`tellraw ${selector} ${nbt(data)}`);
}

// effect give <entity> <effect> [<seconds>] [<amplifier>] [<hideParticles>]
// effect clear <entity> [<effect>]

type Effect =
  | "minecraft:glowing"
  | "minecraft:regeneration"
  | "minecraft:resistance";

export function effect(op: "clear", entity: Selector, effect?: Effect): Command;
export function effect(
  op: "give",
  entity: Selector,
  effect: Effect,
  seconds?: number,
  amplifier?: number,
  hideParticles?: boolean
): Command;
export function effect(...args: unknown[]): Command {
  return command(`effect ${args.join(" ")}`);
}

export function schedule(
  fn: McFunction | CodeGenerator,
  time: number | string,
  append?: boolean
): Command;
export function schedule(
  clear: "clear",
  fn: McFunction | CodeGenerator
): Command;
export function schedule(...args: unknown[]): Command {
  if (args[0] === "clear") {
    return command(`schedule clear ${args[1]}`);
  } else {
    const [fn, time, append = false] = args;

    return command(
      `schedule function ${fn} ${time} ${append ? "append" : "replace"}`
    );
  }
}

export function team(op: "add", team: string, displayName?: string): Command;
export function team(op: "empty", team: string): Command;
export function team(op: "join", team: string, members: Selector): Command;
export function team(op: "leave", members: Selector): Command;
export function team(op: "list", team: string): Command;
export function team(
  op: "modify",
  team: string,
  option: string,
  value: string
): Command;
export function team(op: "remove", team: string): Command;
export function team(...args: unknown[]): Command {
  return command(`team ${args.join(" ")}`);
}

/*
    title <player> clear (removes the screen title from the screen)
    title <player> reset (resets options to default values)
    title <player> title <raw json title> (displays the text as the title position)
    title <player> subtitle <raw json title> (displays the text in the subtitle position)
    title <player> actionbar <raw json title> (displays the text as the action bar position)
    title <player> times <fadeIn> <stay> <fadeOut> (specifies fade-in, stay, and fade-out times)
    */
export function title(player: Selector, op: "clear"): Command;
export function title(player: Selector, op: "reset"): Command;
export function title(player: Selector, op: "title", rawJson: NBTData): Command;
export function title(
  player: Selector,
  op: "subtitle",
  rawJson: NBTData
): Command;
export function title(
  player: Selector,
  op: "actionbar",
  rawJson: NBTData
): Command;
export function title(
  player: Selector,
  op: "times",
  fadeIn: number,
  stay: number,
  fadeOut: number
): Command;
export function title(
  player: Selector,
  op: unknown,
  ...args: unknown[]
): Command {
  switch (op) {
    case "title":
    case "subtitle":
      const data = args[0] as NBTData;

      return command(`title ${player} ${op} ${nbt(data)}`);
    default:
      return command(`title ${player} ${op} ${args.join(" ")}`);
  }
}

// TODO: Check the game rule names
export function gamerule(name: string, value: number | boolean): Command;
export function gamerule(...args: unknown[]): Command {
  return command(`gamerule ${args.join(" ")}`);
}

export function teleport(destination: Selector): Command;
export function teleport(targets: Selector, destination: Selector): Command;
export function teleport(targets: Selector, entity: Selector): Command;
export function teleport(
  targets: Selector,
  location: Selector,
  f: "facing",
  facingLocation: Location
): Command;
export function teleport(
  targets: Selector,
  location: Selector,
  f: "facing entity",
  facingEntity: Selector,
  facingAnchor?: string
): Command;
export function teleport(
  targets: Selector,
  location: Selector,
  rotation?: number
): Command;
export function teleport(...args: unknown[]): Command {
  return command(`teleport ${args.join(" ")}`);
}
