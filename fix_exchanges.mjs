#!/usr/bin/env tron

import { runInternalScript, SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();

// Получаем список шопов на хосте.
let shops;
if (argv._.length === 0) {
  shops = await runInternalScript("list_shops.mjs");
  if (!shops) {
    process.exit(1);
  }
} else {
  shops = argv._;
}

// Заменяем mm2.php
await $`cp -f ${path.join(__dirname, "assets", "mm2.php")} /share/app/code/config/mm2.php`;

const result = {};
for (const shop of shops) {
  cd(path.join(SOLARIS_PROJECTS_PATH, shop));

  // 1.
  await $`rm ./laravel_cache/config.php`.nothrow();

  // 2.
  let result = await $`./docker-compose.sh down && ./docker-compose.sh up -d`.nothrow();
  if (result.exitCode === 0) {
    // 3.
    result = await $`./docker-compose.sh exec php-fpm ./artisan route:clear`.nothrow();
    if (result.exitCode === 0) {
      console.log(`${shop}: ok`);
    } else {
      console.error(`${shop}: incomplete`);
    }
  } else {
    console.error(`${shop}: incomplete`);
  }
}

cd(oldCwd);
