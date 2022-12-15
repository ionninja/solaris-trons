#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH, runInternalScript } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();
const scriptsPath = __dirname;

// Получаем список шопов на хосте.
let shops;
if (argv._.length === 0) {
  const shops = await runInternalScript("list_shops.mjs");
  if (!shops) {
    process.exit(1);
  }
} else {
  shops = argv._;
}

for (const shop of shops) {
  cd(path.join(SOLARIS_PROJECTS_PATH, shop));

  let result = await $`./docker-compose.sh down && ./docker-compose.sh up -d`.nothrow();
  if (result.exitCode === 0) {
    console.log(`${shop}: ok`);
  } else {
    console.error(`${shop}: incomplete`);
  }
}

cd(oldCwd);
