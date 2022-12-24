#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH, runInternalScript } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();

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

  let result = await $`./docker-compose.sh up -d`.nothrow();
  if (result.exitCode === 0) {
    await runInternalScript("artisan.mjs", "down");
    const contName = `${shop}_database_1`;
    const contIp = await runInternalScript("docker_cont_ip.mjs", `${shop.toLowerCase()}_database_1`);
    console.log(contName, contIp);
  } else {
    console.error(`${shop}: incomplete`);
  }
}


cd(oldCwd);