import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { objectives, queue } from "./queue";
import DataPack from "./datapack";
export { McFunction } from "./types";
export * from "./game-types";
export * from "./commands";

export default DataPack;

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const minecraft = new DataPack("minecraft");

export const mcTick = minecraft.makeTag("functions", "tick");
export const mcLoad = minecraft.makeTag("functions", "load");

const tsPack = new DataPack("ts_pack");
mcLoad(
  tsPack.mcFunction(function* load() {
    yield `# ts-datapack`;
    if (objectives.length > 0) {
      yield objectives.join("\n");
    }
  })
);

type McFile = {
  filename: string;
  content: string;
};
type Files = Record<McFile["filename"], McFile>;
function buildPlan(): Files {
  if (objectives.length > 0) {
  }
  String(mcTick);
  String(mcLoad);

  const files: Files = {};
  for (let i = 0; i < queue.length; i++) {
    const file = queue[i];

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

export async function build(_targetDirectory: string): Promise<void> {
  const plan = buildPlan();

  await Promise.all(
    Object.values(plan).map(async (file) => {
      const fullPath = path.join(_targetDirectory, file.filename);
      const dir = path.dirname(fullPath);
      await mkdir(dir, { recursive: true });
      console.log("writing", file.filename);
      writeFile(fullPath, file.content);
    })
  );
}
