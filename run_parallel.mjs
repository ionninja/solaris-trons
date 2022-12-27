#!/usr/bin/env tron

import { getShops, runInternalScript } from './common.mjs';

$.verbose = true;

const shops = await getShops();
console.log(YAML.stringify(shops));
const concurrent = argv.c;
const shopsPerInstance = Math.floor(shops.length / concurrent);
const queue = [];


for (let i = 0; i <= concurrent; i++) {
  const result = [];
  for (let j = 0; j < shopsPerInstance; j++) {
    const shopIndex = i * shopsPerInstance + j;
    if (shopIndex >= shops.length) {
      break;
    }
    result.push(shops[shopIndex]);
  }
  queue.push(result);
}

let done = false;

const runParallel = () => {
  while (shops.length > 0) {
    for (let i = 0; i < concurrent - queue.length; i++) {
      const p = runInternalScript(argv.script, true, shops.shift());
      p.then(() => runParallel()).catch(() => {});
      queue.push(p);
    }
  }
};

runParallel();