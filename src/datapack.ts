import * as path from "path";
import { objectives, queue } from "./queue";
import {
  ScoreboardInput,
  Scoreboard,
  CodeGenerator,
  McFunction,
  LootInput,
  DataPackFile,
  TagType,
  Tag,
} from "./types";
import { SelectorArgs, Selector } from "./game-types";

export default class DataPack {
  constructor(private namespace: string) {}

  public makeScoreboard<T extends ScoreboardInput>(
    namespace: string,
    variables: T
  ): Scoreboard<T> {
    const scoreboard = {} as Scoreboard<T>;
    for (const name in variables) {
      if (variables.hasOwnProperty(name)) {
        const type = variables[name];

        scoreboard[name] = {
          toString: (): string => {
            return `${namespace}.${name}`;
          },
        };
        objectives.push(
          `scoreboard objectives add ${scoreboard[name]} ${type}\n`
        );
      }
    }
    return scoreboard;
  }

  public mcFunction(fn: CodeGenerator, name: string = fn.name): McFunction {
    if (!name) {
      throw new Error(
        "missing name. Either use a function declaration or pass a name"
      );
    }
    const filename = path.join(
      "data",
      this.namespace,
      "functions",
      `${name}.mcfunction`
    );

    const mcFn: McFunction = Object.assign(fn, {
      type: "mcfunction" as const,
      filename,
      toString: (): string => {
        if (!queue.includes(mcFn)) {
          queue.push(mcFn);
        }
        return `${this.namespace}:${name}`;
      },
      content(): string {
        let content = "# Generated by ts-datapack\n\n";
        for (const text of fn()) {
          content += text.trim() + "\n\n";
        }
        return content
          .split(/\r?\n/)
          .map((s) => s.trim())
          .join("\n");
      },
    });
    return mcFn;
  }

  public makeLootTable(name: string, table: LootInput): DataPackFile {
    const filename = path.join(
      "data",
      this.namespace,
      "loot_tables",
      `${name}.json`
    );

    const lootTable = {
      filename,
      toString: (): string => {
        const fullName = `${this.namespace}:${name}`;
        if (!queue.includes(lootTable)) {
          queue.push(lootTable);
        }
        return fullName;
      },
      content: (): string => JSON.stringify(table(), null, 2),
    };
    return lootTable;
  }

  public makeTag(type: TagType, name: string): Tag {
    const filename = path.join(
      "data",
      this.namespace,
      "tags",
      type,
      name + ".json"
    );

    const values: Array<McFunction | string> = [];
    const tag: Tag = Object.assign(
      (...newValues: typeof values): void => {
        values.push(...newValues);
      },
      {
        type: "tag" as const,
        values,
        filename,
        toString: (): string => {
          if (!queue.includes(tag)) {
            queue.push(tag);
          }
          return `#${this.namespace}:${name}`;
        },
        content(): string {
          if (values.length === 0) {
            return "";
          }

          const data = {
            values: values.map(String),
          };

          return JSON.stringify(data, null, 2);
        },
      }
    );
    return tag;
  }

  public createSelector(name: string, args: SelectorArgs = {}): Selector {
    const selector = (newArgs: SelectorArgs): Selector => {
      return this.createSelector(name, {
        ...args,
        ...newArgs,
      });
    };
    selector.toString = (): string => {
      const tmp = Object.keys(args).flatMap((arg) => {
        if (args[arg] != null) {
          return [`${arg}=${args[arg]}`];
        }
        return [];
      });
      if (tmp.length > 0) {
        return `${name}[${tmp.join(",")}]`;
      }
      return name;
    };

    return selector;
  }

  public command(...args: string[]): string {
    return args.join(" ");
  }
  public nbt(data: Record<string, any>): string {
    return JSON.stringify(data);
  }
}
