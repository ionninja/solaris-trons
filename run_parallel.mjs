#!/usr/bin/env tron

import { getShops, runInternalScript } from './common.mjs';

$.verbose = true;

const shops = await getShops();
const concurrent = argv.c;
const queue = [];

const runNext = () => {
  for (let i = 0; i < concurrent - queue.length && shops.length > 0; i++) {
    const p = runInternalScript(argv.script, true, shops.shift());
    p.then(() => runNext()).catch(() => {});
    queue.push(p);
  }
};

runNext();