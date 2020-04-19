import { LootEntry } from "./game-types";

// I'm using enum for internal types
export enum FileType {
  McFunction,
  LootTable,
  Tag,
}

// Types that are used as parameters are just strings. I'm trying to find the
// balance of keeping user-land stuff similar to Minecraft, while keeping the
// advantages of TypeScript. That's why all exposed functions are also
// snake_case.
export type TagType =
  | "blocks"
  | "entity_types"
  | "fluids"
  | "functions"
  | "items";

export interface DataPackFile<T extends FileType> {
  type: T;
  toString: () => string;
  filename: string;
  content: () => string;
}

export type Command = { type: "command"; toString(): string };

type CodeGenReturn = Generator<Command | McFunction>;
export type CodeGenerator = () => CodeGenReturn;

export type McFunction = DataPackFile<FileType.McFunction> & CodeGenerator;

export type LootTable = DataPackFile<FileType.LootTable>;

type TagToDataPackFile<T extends TagType> = T extends "functions"
  ? DataPackFile<FileType.McFunction>
  : never;

export type Tag<T extends TagType = TagType> = DataPackFile<FileType.Tag> &
  ((...values: Array<TagToDataPackFile<T> | Tag<T> | string>) => void) & {
    values: Array<TagToDataPackFile<T> | Tag<T> | string>;
  };

type TagMap<T extends TagType = TagType> = Partial<
  Record<T, Record<string, Tag<T>["values"]>>
>;

export type DataPackExport = {
  tags: TagMap;
};

export type LootInput = () => {
  type: string;
  pools: Array<{
    rolls: number;
    entries: LootEntry[];
  }>;
};

type Criteria =
  | "dummy"
  | "trigger"
  | "deathCount"
  | "playerKillCount"
  | "totalKillCount"
  | "health"
  | "xp"
  | "level"
  | "food"
  | "air"
  | "armor ";

export type Objective = {
  toString: () => string;
  criteria: Criteria;
  name: string;
  displayName?: string;
};
export type ScoreboardInput = {
  [variableName: string]: Criteria; // type
};
export type Scoreboard<T> = {
  [variableName in keyof T]: Objective;
};
