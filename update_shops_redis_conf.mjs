#!/usr/bin/env tron

import { runInternalScript, SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const DELS = [
  "REDIS_DATABASE",
];

const CONF_PATH = '/share/app/shops_redisdb.json';

const oldCwd = process.cwd();

// Получаем список шопов на хосте.
const shops = await runInternalScript("list_shops.mjs");
if (!shops) {
  process.exit(1);
}

let result;
if (await fs.pathExists(CONF_PATH)) {
  const content = await fs.readFile(CONF_PATH, { encoding: 'utf8' });
  result = YAML.parse(content);
} else {
  result = {};
  let i = 0;
  for (const shopId of shops) {
    result[shopId] = i++;
  }
}
let i = 0;
for (const shopId of shops) {
  try {
    cd(path.join(SOLARIS_PROJECTS_PATH, shopId));

    const dbId = result[shopId];

    const envLines = (await fs.readFile(".env", { encoding: 'utf8' })).split("\n").filter((l) => {
      for (const d of DELS) {
        if (l.startsWith(d)) {
          return false;
        }
      }
      return true;
    });
    envLines.push(`REDIS_DATABASE=${dbId}`);
    await fs.writeFile(".env", envLines.join("\n"));
    console.log(`${shopId} (${dbId}): ok`);
  } catch (ex) {
    cd(oldCwd);
    console.log(`${shopId}: fail`);
    console.error(ex);
    process.exit(1);
  }
}

await fs.writeFile(CONF_PATH, YAML.stringify(result));

cd(oldCwd);
