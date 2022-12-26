#!/usr/bin/env tron

import { runInternalScript, SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const DELS = [
  "BITCOIN_RPC_PORT",
  "BITCOIN_RPC_USER",
  "BITCOIN_RPC_PASSWORD",
  "PERCONA_ROOT_PASSWORD"
];

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

const internalIp = (await $`ifconfig nm-solaris | grep "inet " | awk '{print $2}'`).stdout.trim();
const EDIT_OPTS = {
  PERCONA_DATABASE: (k, shopId) => `${k}=shop_${shopId.toLowerCase()}`,
  PERCONA_USER: "solaris",
  PERCONA_PASSWORD: "solaris",
  LOCAL_SYNC_URL: "10.20.30.9:8800",
  LOCAL_IP: internalIp
};
const EDIT_KEYS = Object.keys(EDIT_OPTS);

for (const shopId of shops) {
  try {
    cd(path.join(SOLARIS_PROJECTS_PATH, shopId));

    const envLines = (await fs.readFile(".env", { encoding: 'utf8' })).split("\n").filter((l) => {
      for (const d of DELS) {
        if (l.startsWith(d)) {
          return false;
        }
      }
      return true;
    });
    
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
    console.log(`${shopId}: ok`);
  } catch (ex) {
    console.log(`${shopId}: fail`);
    console.error(ex);
  } 
}

cd(oldCwd);