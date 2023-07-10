import path from "node:path";
import fs from "node:fs/promises";

export const exists = async (path: string) => fs.open(path).then(() => true, () => false);

const jsonCache = new Map<string, any>();
export async function getLocalJson<T = any>(filePath: string, options?: { reloadCache?: boolean }): Promise<T> {
  const { reloadCache } = options || { reloadCache: false };
  filePath = path.resolve(process.cwd(), filePath);
  if (!reloadCache && jsonCache.has(filePath)) return jsonCache.get(filePath);
  if (!(await exists(filePath))) throw new Error("File not exists in local disk");
  const objJSON = JSON.parse(await fs.readFile(filePath, "utf8"));
  jsonCache.set(filePath, objJSON);
  return objJSON;
}