#!/usr/bin/env tron

import { getLANIp, SOLARIS_PROJECTS_PATH, getShops } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();

const shops = await getShops();
const lanIp = await getLANIp();

const ENV_DELS = [
  "BITCOIN_RPC_PORT",
  "BITCOIN_RPC_USER",
  "BITCOIN_RPC_PASSWORD",
  "PERCONA_ROOT_PASSWORD",
  "REDIS_DATABASE"
];

const EDIT_OPTS = {
  PERCONA_DATABASE: (k, shopId) => `${k}=shop_${shopId.toLowerCase()}`,
  PERCONA_USER: "solaris",
  PERCONA_PASSWORD: "solaris",
  LOCAL_SYNC_URL: "10.20.30.9:8800",
  LOCAL_IP: lanIp
};

const CONF_PATH = '/share/app/shops_redisdb.yaml';


const fixEnv = async (shopId) => {
  const EDIT_KEYS = Object.keys(EDIT_OPTS);

  try {
    let shopRedisDBMap;
    if (await fs.pathExists(CONF_PATH)) {
      const content = await fs.readFile(CONF_PATH, { encoding: 'utf8' });
      shopRedisDBMap = YAML.parse(content);
    } else {
      shopRedisDBMap = {};
      let i = 0;
      for (const shopId of shops) {
        shopRedisDBMap[shopId] = i++;
      }
    }
    await fs.writeFile(CONF_PATH, YAML.stringify(shopRedisDBMap));


    const envLines = (await fs.readFile(".env", { encoding: 'utf8' })).split("\n").filter((l) => {
      for (const d of ENV_DELS) {
        if (l.startsWith(d)) {
          return false;
        }
      }
      return true;
    });

    envLines.push(`REDIS_DATABASE=${dbId}`);

    for (let n = 0; n < envLines.length; n++) {
      for (const k of EDIT_KEYS) {
        if (envLines[n].startsWith(k)) {
          if (typeof EDIT_OPTS[k] === "function") {
            envLines[n] = EDIT_OPTS[k](k, shopId);
          } else {
            envLines[n] = `${k}=${EDIT_OPTS[k]}`;
          }
        }
      }
    }

    await fs.writeFile(".env", envLines.join("\n"));
    return true;
  } catch (ex) {
    cd(oldCwd);
    console.log(`[${shopId}] [fixEnv] fail`);
    console.error(ex);
    return false;
  }
}

if (argv['fix-nginx']) {
  console.log(`[${shopId}] fixing nginx antiddos files`);

  const basePath = '/share/app/docker/nginx/antiddos';
  const files = await fs.readdir(basePath);
  for (const f of files) {
    await $`sed -i 's/red:connect("redis", 6379)/red:connect("${lanIp}", 6379)/g' ${basePath}/${f}`;
  }
}

for (const shopId of shops) {
  const shopBasePath = path.join(SOLARIS_PROJECTS_PATH, shopId);
  cd(shopBasePath);

  try {
    if (argv['fix-docker-compose']) {
      console.log(`[${shopId}] updating docker-compose.sh`);
      await $`sed -i 's/docker-compose -f/docker compose -f/g' ${shopBasePath}/docker-compose.sh`;
    }

    consolr.log(`[${shopId}] updating .env`);
    await fixEnv(shopId);

    console.log(`[${shopId}] stopping docker`);
    await $`./docker-compose.sh down`;

    console.log(`[${shopId}] rm -R laravel_cache/*`);
    try {
      await $`rm -R laravel_cache/*`;
    } catch (ex) {
      console.log(`[${shopId}] clear cache error`);
      console.error(ex);
    }

    console.log(`[${shopId}] chown dirs`);
    await $`chown -R 1001:1001 database`;
    await $`chown -R 1000:33 storage`;
    await $`chown -R 1001:1001 cache`;

    // ??? - оно может и не надо это тут, учитывая, что в `up` отдаётся флаг `--build`
    console.log(`[${shopId}] rebuilding docker`);
    await $`./docker-compose.sh build`;

    console.log(`[${shopId}] starting docker with --build`);
    await $`./docker-compose.sh up -d --build`;

    // artisan ...
    console.log(`[${shopId}] artisan migrate --force`);
    await $`./docker-compose.sh exec php-fpm ./artisan migrate --force`;

    try {
      console.log(`[${shopId}] artisan mm2:close_preorders`);
      await $`./docker-compose.sh exec php-fpm ./artisan mm2:close_preorders`;
    } catch (ex) {
      console.log(`[${shopId}] [artisan mm2:close_preorders] fail`);
      console.error(ex);
    }

    console.log(`[${shopId}] artisan cpp:init-system`);
    await $`./docker-compose.sh exec php-fpm ./artisan cpp:init-system`;

    console.log(`[${shopId}] artisan route:clear`);
    await $`./docker-compose.sh exec php-fpm ./artisan route:clear`;

    console.log(`[${shopId}] artisan up`);
    await $`./docker-compose.sh exec php-fpm ./artisan up`;

  } catch (ex) {
    console.log(`[${shopId}] fail`);
    console.error(ex);
  }
}

cd(oldCwd);
