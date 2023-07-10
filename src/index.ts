#!/usr/bin/env node
import { getInput } from "@actions/core";
import path from "node:path";
import { getLocalJson } from "./utils.js";
import { execSync } from "node:child_process";
import { http } from "@sirherobrine23/http";

let __registryToken: string = getInput("token"), npmargs = getInput("npmargs") || "";

const rootJSONPath = path.join(process.cwd(), getInput("package-path") || "package.json");
const localJSON = await getLocalJson(rootJSONPath);

async function publish(rootJSONPath: string) {
  const localJSON = await getLocalJson(rootJSONPath);
  if (localJSON.private) return console.log("Packages %O is private skiping", localJSON.name);
  const registryURL = localJSON.publishConfig?.registry || "registry.npmjs.org";
  const inRegistry = await http.jsonRequestBody<{versions: Record<string, any>}>(new URL(`/${localJSON.name}`, "http://"+registryURL));
  if (inRegistry.versions[localJSON.version]) return console.log("Packages %O is published %O", localJSON.name, localJSON.version);

  execSync(("npm publish "+npmargs).trim(), {
    stdio: "inherit",
    cwd: path.dirname(rootJSONPath),
    env: {
      ...process.env,
      ...(__registryToken ? {
        NODE_AUTH_TOKEN: __registryToken
      } : {})
    }
  });
}

if (!localJSON.workspaces) await publish(rootJSONPath);
else {
  for (const localPackage of localJSON.workspaces.packages || localJSON.workspaces) await publish(path.join(path.dirname(rootJSONPath), localPackage));
}
