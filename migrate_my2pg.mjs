#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH, runInternalScript } from './common.mjs';

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

// Создаём базы данных


for (const shop of shops) {
  cd(path.join(SOLARIS_PROJECTS_PATH, shop));

  // Запускаем шоп
  let result = await $`./docker-compose.sh up -d`.nothrow();
  if (result.exitCode === 0) {
    // Режим техобслуживания
    const modeResult = await runInternalScript("artisan.mjs", true, "down");
    if (!modeResult) {
      console.error(`cannot maintenance ${shop} - ignore`);
    }
    const shopName = shop.toLowerCase();
    const contName = `${shopName}_database_1`;
    
    // Узнаём IP нужного нам контейнера с mysql-ом.
    const contIp = await runInternalScript("docker_cont_ip.mjs", true, contName);
    // console.log(contName, contIp);

    if (!contIp) {
      console.error(`unknown ip address of '${contName}' docker container - ignore`)
      continue;
    }

    // Запускаем pgloader.
    const pgloaderResult = await $`pgloader mysql://root:rootpassword@${contIp}/database pgsql://solaris:solaris@10.20.30.1:5432/shop_${shopName}`;
    if (pgloaderResult.exitCode === 0) {
      console.error(pgloaderResult.stdout);
    } else {
      console.error(pgloaderResult.stderr);
    }
  } else {
    console.error(result.stderr);
  }
}


cd(oldCwd);