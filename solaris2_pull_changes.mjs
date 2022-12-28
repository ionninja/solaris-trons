#!/usr/bin/env tron

import { runInternalScript } from './common.mjs';
import { pull as gitPull } from "isomorphic-git";

$.verbose = false;

const oldCwd = process.cwd();

let dir;
switch (argv.t) {
  case 'code': dir = '/share/app/code'; break;
  case 'share': dir = '/share'; break;
  case 'trons': dir = '/opt/solaris-trons'; break;
}

cd(dir);

await gitPull({
  fs,
  http,
  dir,
  ref: 'master',
  singleBranch: true,
  author: {
    name: 'morph',
    email: 'hpromatem@protonmail.com'
  },
  username: 'morph',
  token: 'glpat-pH8rxCGGi-pqfxMdsKqb',
});

await runInternalScript("solaris2_post_process.mjs");

cd(oldCwd);
