import { LootEntry } from "./game-types";
import { ExecuteCommand } from "./commands";

export interface DataPackFile {
  toString: () => string;
  filename: string;
  content: () => string;
}
export type CodeGenerator = () => Generator<string | ExecuteCommand>;

export type McFunction = CodeGenerator & {
  type: "mcfunction";
} & DataPackFile;

export type Tag = ((...values: Array<McFunction | string>) => void) & {
  type: "tag";
  values: Array<McFunction | string>;
} & DataPackFile;

export type TagType =
  | "blocks"
  | "entity_types"
  | "fluids"
  | "functions"
  | "items";

export type LootInput = () => {
  type: string;
  pools: Array<{
    rolls: number;
    entries: LootEntry[];
  }>;
};

export type ScoreboardInput = {
  [variableName: string]: string; // type
};

export type Scoreboard<T> = {
  [variableName in keyof T]: {
    toString: () => string;
  };
};
