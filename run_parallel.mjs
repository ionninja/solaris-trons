#!/usr/bin/env tron

import { getShops, runInternalScript } from './common.mjs';

$.verbose = true;

const shops = await getShops();
const concurrent = argv.c;
const queue = new Map();

const runNext = () => {
  for (let i = 0; i < concurrent - queue.length && shops.length > 0; i++) {
    const shopName = shops.shift();
    const p = runInternalScript(argv.script, true, shops.shift());
    p.then(() => {
      queue.delete(shopName);
      runNext();
    }).catch(() => {});
    queue.set(shopName, p);
  }
};

runNext();

const check = () => {
  if (queue.length > 0 || shops.length > 0) {
    setTimeout(check, 1000);
  }
}

setTimeout(check, 1000);