#!/usr/bin/env tron

import { runInternalScript, SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;


const oldCwd = process.cwd();

// Получаем список шопов на хосте.
const shops = await runInternalScript("list_shops.mjs");
if (!shops) {
  process.exit(1);
}

const result = {};
let i = 0;
for (const shopId of shops) {
  const dbId = i++;
  result[shopId] = dbId;

  try {
    cd(path.join(SOLARIS_PROJECTS_PATH, shopId));

    const envLines = (await fs.readFile(".env", { encoding: 'utf8' })).split("\n");
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

await fs.writeFile(`/share/app/shops_redisdb.json`, YAML.stringify(result));

cd(oldCwd);
