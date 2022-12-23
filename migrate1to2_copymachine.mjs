#!/usr/bin/env tron

import { runInternalScript, SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();

// Получаем список шопов на хосте.
const shops = await runInternalScript("list_shops.mjs");
if (!shops) {
  process.exit(1);
}

await $`scp -r -q /share/modules root:${argb.pwd}@${argv.ip}:/share/modules`;

const result = {};
for (const shop of shops) {
  await runInternalScript("shop_down.mjs", true, shop);

}

cd(oldCwd);