import { command, Position, NBTData } from ".";
import { Command } from "../types";
import { Selector } from "..";

export function data(
  op: "get",
  type: "block",
  targetPos: Position,
  path?: string,
  scale?: number
): Command;
export function data(
  op: "get",
  type: "entity" | "storage",
  target: Selector,
  path?: string,
  scale?: number
): Command;
export function data(
  op: "merge",
  type: "block",
  target: Position,
  nbt: NBTData
): Command;
export function data(
  op: "merge",
  type: "entity" | "storage",
  target: Selector,
  nbt: NBTData
): Command;
export function data(op: "remove", type: "block", targetPos: Position): Command;
export function data(
  op: "remove",
  type: "entity" | "storage",
  target: Selector
): Command;
export function data(...args: unknown[]): Command {
  return command(`${args.join(" ")}`);
}
// data modify block <targetPos> <targetPath> (append|insert <index>|merge|prepend|set) from block <sourcePos> <sourcePath>
// data modify block <targetPos> <targetPath> (append|insert <index>|merge|prepend|set) from entity <source> <sourcePath>
// data modify block <targetPos> <targetPath> (append|insert <index>|merge|prepend|set) from storage <source> <sourcePath>
// data modify block <targetPos> <targetPath> (append|insert <index>|merge|prepend|set) value <nbt>
// data modify entity <target> <targetPath> (append|insert <index>|merge|prepend|set) from block <sourcePos> <sourcePath>
// data modify entity <target> <targetPath> (append|insert <index>|merge|prepend|set) from entity <source> <sourcePath>
// data modify entity <target> <targetPath> (append|insert <index>|merge|prepend|set) from storage <source> <sourcePath>
// data modify entity <target> <targetPath> (append|insert <index>|merge|prepend|set) value <value>
// data modify storage <target> <targetPath> (append|insert <index>|merge|prepend|set) from block <sourcePos> <sourcePath>
// data modify storage <target> <targetPath> (append|insert <index>|merge|prepend|set) from entity <source> <sourcePath>
// data modify storage <target> <targetPath> (append|insert <index>|merge|prepend|set) from storage <source> <sourcePath>
// data modify storage <target> <targetPath> (append|insert <index>|merge|prepend|set) value <value>
