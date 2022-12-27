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
    console.log(`${shopId}: stopping`);
    await $`./docker-compose.sh down`;

    console.log(`${shopId}: rm -R laravel_cache/*`);
    try {
      await $`rm -R laravel_cache/*`;
    } catch (ex) {
      console.log(`${shopId}: clear cache error`);
      console.error(ex);
    }

    console.log(`${shopId}: chown dirs`);
    await $`chown -R 1001:1001 database`;
    await $`chown -R 1000:33 storage`;
    await $`chown -R 1001:1001 cache`;

    console.log(`${shopId}: rebuilding docker`);
    await $`./docker-compose.sh build`;
    
    console.log(`${shopId}: starting`);
    await $`./docker-compose.sh up`;
    
    // artisan ...
    console.log(`${shopId}: artisan migrate --force`);
    await $`./docker-compose.sh exec php-fpm ./artisan migrate --force`;
    
    console.log(`${shopId}: artisan mm2:close_preorders`);
    await $`./docker-compose.sh exec php-fpm ./artisan mm2:close_preorders`;

    console.log(`${shopId}: artisan cpp:init-system`);
    await $`./docker-compose.sh exec php-fpm ./artisan cpp:init-system`;

    console.log(`${shopId}: artisan route:clear`);
    await $`./docker-compose.sh exec php-fpm ./artisan route:clear`;

    console.log(`${shopId}: artisan up`);
    await $`./docker-compose.sh exec php-fpm ./artisan up`;
  
  } catch (ex) {
    console.log(`${shopId}: fail`);
    console.error(ex);
  }
}

cd(oldCwd);
