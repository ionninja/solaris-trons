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

for (const shopId of shops) {
  cd(path.join(SOLARIS_PROJECTS_PATH, shopId));

  try {
    // Стопаем шоп
    await runInternalScript("shop_down.mjs", true, shopId);

    // Удаляем кэш 
    try {
      await $`rm -R laravel_cache/*`;
    } catch (ex) {
      console.log(`${shopId}: clear cache error`);
      console.error(ex);
    }
    // Выставляем нужные права на папка
    await $`chown -R 1001:1001 database`;
    await $`chown -R 1000:33 storage`;
    await $`chown -R 1001:1001 cache`;

    // Пересобираем докер. 
    await runInternalScript("shop_up.mjs", true, shopId);
    // Запускаем докер
    await runInternalScript("shop_up.mjs", true, shopId);
    
    // artisan ...
    await runInternalScript("artisan.mjs", true, '--cmd "migrate --force"');
    await runInternalScript("artisan.mjs", true, '--cmd "mm2:close_preorders"');
    await runInternalScript("artisan.mjs", true, '--cmd "cpp:init-system"');
    await runInternalScript("artisan.mjs", true, '--cmd "route:clear"');
    await runInternalScript("artisan.mjs", true, '--cmd "up"');
  
    console.log(`${shopId}: ok`);
  } catch (ex) {
    console.log(`${shopId}: fail`);
    console.error(ex);
  }
}

cd(oldCwd);
