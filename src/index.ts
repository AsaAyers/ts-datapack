import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { objectives, queue } from "./queue";
import DataPack from "./datapack";
import { command } from "./commands";
import { DataPackFile, FileType } from "./types";
export { McFunction } from "./types";
export * from "./game-types";
export * from "./commands";
export * from "./commands/loot";

export default DataPack;

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const tsPack = new DataPack("ts_pack", "tsp");

const load = tsPack.mcFunction(function* load() {
  yield command(`# ts-datapack`);
  if (objectives.length > 0) {
    yield command(objectives.join("\n"));
  }
});
tsPack.register({
  tags: {
    functions: {
      "minecraft:load": [load],
    },
  },
});

type McFile = {
  filename: string;
  content: string;
};
type Files = Record<McFile["filename"], McFile>;
export function processQueue(q: DataPackFile<FileType>[] = queue): Files {
  const files: Files = {};
  for (let i = 0; i < q.length; i++) {
    const file = q[i];

    const { filename } = file;
    if (files[filename]) {
      throw new Error(`duplicate filename}`);
    }

    const content = file.content();
    if (content) {
      files[filename] = { filename, content };
    }
  }

  return files;
}

export async function build(
  datapack: DataPack,
  targetDirectory: string
): Promise<void> {
  // String(mcTick);
  // String(mcLoad);

  datapack.run();
  const plan = processQueue(queue);

  await Promise.all(
    Object.values(plan).map(async (file) => {
      const fullPath = path.join(targetDirectory, file.filename);
      const dir = path.dirname(fullPath);
      await mkdir(dir, { recursive: true });
      // console.log("writing", file.filename);
      writeFile(fullPath, file.content);
    })
  );
}
