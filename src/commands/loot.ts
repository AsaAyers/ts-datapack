import { Command, LootTable } from "../types";
import { command, Position, Selector } from "..";

type LootPrefix = {
  prefix: string;
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  source: typeof source;
};

type LootTableId = string | LootTable;

export function source(
  source: "fish",
  lootTableId: LootTableId,
  fishingLocation: string,
  idk: string // [<item>|mainhand|offhand]
): Command;
export function source(source: "loot", lootTableId: LootTableId): Command;
export function source(source: "kill", entity: Selector): Command;
export function source(
  source: "mine",
  position: Position,
  idk: string // [<item>|mainhand|offhand]
): Command;
export function source(this: LootPrefix, ...args: unknown[]): Command {
  return command(`${this.prefix} ${args.join(" ")}`);
}

export function loot(op: "spawn", position: Position): LootPrefix;
export function loot(
  op: "replace",
  replaceKind: "entity",
  entitySelector: Selector,
  slot: number,
  count?: number
): LootPrefix;
export function loot(
  op: "replace",
  replaceKind: "block",
  position: Position,
  slot: number,
  count?: number
): LootPrefix;
export function loot(op: "give", player: Selector): LootPrefix;
export function loot(op: "insert", position: Position): LootPrefix;
export function loot(...args: unknown[]): LootPrefix {
  return {
    prefix: `loot ${args.join(" ")}`,
    source,
  };
}
