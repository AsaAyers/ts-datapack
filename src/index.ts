import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { queue } from "./queue";
import DataPack from "./datapack";
import { DataPackFile, FileType } from "./types";
export { McFunction } from "./types";
export * from "./game-types";
export * from "./commands";
export * from "./commands/loot";

export default DataPack;

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

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
