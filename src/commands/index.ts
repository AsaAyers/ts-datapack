/* eslint-disable @typescript-eslint/camelcase */
export * from "./loot";
import { Selector, Location } from "../game-types";
import { Objective, McFunction, CodeGenerator, Command, Tag } from "../types";

export function command(...args: string[]): Command {
  return {
    type: "command",
    toString(): string {
      return args.join(" ").trim();
    },
  };
}

export type NBTData = Record<string, any>;
export function nbt(data: NBTData): string {
  return JSON.stringify(data);
}

export class ExecuteCommand {
  command = "execute";

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
  run(cmd: Command | McFunction | CodeGenerator | Tag<"functions">): Command {
    // If you just pass an McFunciton directly, this assumes you want to run it
    // with the `function` command. since funciton is a keyword in JS, I can't
    // make a function(fn: McFunction): string
    if (typeof cmd === "function") {
      return this.run(command(`function ${cmd}`));
    }

    this.command = `${this.command} run ${cmd}`;

    return {
      type: "command",
      toString: (): string => {
        return this.command;
      },
    };
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

// https://github.com/Microsoft/TypeScript/issues/28172
type ScoreboardParams =
  | ["players", "enable", Selector, Objective]
  | ["players", "add" | "set", Selector, Objective, number]
  | [
      "players",
      "operation",
      Selector,
      Objective,
      "+=" | "-=" | "*=" | "/=" | "%=" | "=" | "<" | ">" | "><",
      Selector,
      Objective
    ]
  | ["objectives", "remove", Objective]
  | ["objectives", "setdisplay", string, Objective | undefined]
  | ["objectives", "add", Objective];

export function scoreboard(...args: ScoreboardParams): Command {
  if (args[0] === "objectives" && args[1] == "add") {
    const objective = args[2];
    return command(
      `scoreboard objectives add ${objective.name} ${objective.criteria} ${
        objective.displayName || ""
      }`
    );
  }

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

export enum Particle {
  ambient_entity_effect = "minecraft:ambient_entity_effect",
  angry_villager = "minecraft:angry_villager",
  barrier = "minecraft:barrier",
  block = "minecraft:block",
  bubble = "minecraft:bubble",
  bubble_column_up = "minecraft:bubble_column_up",
  bubble_pop = "minecraft:bubble_pop",
  campfire_cosy_smoke = "minecraft:campfire_cosy_smoke",
  campfire_signal_smoke = "minecraft:campfire_signal_smoke",
  cloud = "minecraft:cloud",
  composter = "minecraft:composter",
  crit = "minecraft:crit",
  current_down = "minecraft:current_down",
  damage_indicator = "minecraft:damage_indicator",
  dolphin = "minecraft:dolphin",
  dragon_breath = "minecraft:dragon_breath",
  dripping_honey = "minecraft:dripping_honey",
  dripping_lava = "minecraft:dripping_lava",
  dripping_water = "minecraft:dripping_water",
  dust = "minecraft:dust",
  effect = "minecraft:effect",
  elder_guardian = "minecraft:elder_guardian",
  enchant = "minecraft:enchant",
  enchanted_hit = "minecraft:enchanted_hit",
  end_rod = "minecraft:end_rod",
  entity_effect = "minecraft:entity_effect",
  explosion = "minecraft:explosion",
  explosion_emitter = "minecraft:explosion_emitter",
  falling_dust = "minecraft:falling_dust",
  falling_honey = "minecraft:falling_honey",
  falling_lava = "minecraft:falling_lava",
  falling_nectar = "minecraft:falling_nectar",
  falling_water = "minecraft:falling_water",
  firework = "minecraft:firework",
  fishing = "minecraft:fishing",
  flame = "minecraft:flame",
  flash = "minecraft:flash",
  happy_villager = "minecraft:happy_villager",
  heart = "minecraft:heart",
  instant_effect = "minecraft:instant_effect",
  item = "minecraft:item",
  item_slime = "minecraft:item_slime",
  item_snowball = "minecraft:item_snowball",
  landing_honey = "minecraft:landing_honey",
  landing_lava = "minecraft:landing_lava",
  large_smoke = "minecraft:large_smoke",
  lava = "minecraft:lava",
  mycelium = "minecraft:mycelium",
  nautilus = "minecraft:nautilus",
  note = "minecraft:note",
  poof = "minecraft:poof",
  portal = "minecraft:portal",
  rain = "minecraft:rain",
  smoke = "minecraft:smoke",
  sneeze = "minecraft:sneeze",
  soul = "minecraft:soul",
  spit = "minecraft:spit",
  splash = "minecraft:splash",
  squid_ink = "minecraft:squid_ink",
  sweep_attack = "minecraft:sweep_attack",
  totem_of_undying = "minecraft:totem_of_undying",
  underwater = "minecraft:underwater",
  witch = "minecraft:witch",
}

export type Position = string;
// minecraft:dust 1.0 1.0 1.0 1.0 ~ ~ ~ 0 0 0 0 1
export function particle(
  name: Particle.dust,
  color: string,
  pos: Position,
  delta: string,
  speed: number,
  count: number,
  mode?: "normal" | "force",
  viewers?: Selector
): Command;
export function particle(
  name: Particle,
  pos: Position,
  delta: string,
  speed: number,
  count: number,
  mode?: "normal" | "force",
  viewers?: Selector
): Command;
export function particle(
  name: Particle,
  speed: number,
  count: number,
  mode?: "normal" | "force",
  viewers?: Selector
): Command;
export function particle(...args: unknown[]): Command {
  return command(`particle ${args.join(" ")}`);
}
