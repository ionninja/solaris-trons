#!/usr/bin/env tron

import { runInternalScript } from './common.mjs';
import { pull as gitPull } from "isomorphic-git";
import * as http from "somorphic-git/http/node";
import fs from "node:fs";

$.verbose = false;

const oldCwd = process.cwd();

let gitDir;
let gitUrl;
switch (argv.t) {
  case 'code':
    gitDir = '/share/app/code';
    gitUrl = 'https://lain-the-wired.com/mm-solaris/shop';
    break;
  case 'share':
    gitDir = '/share';
    gitUrl = 'https://lain-the-wired.com/mm-solaris/share';
    break;
  case 'trons':
    gitDir = '/opt/solaris-trons';
    gitUrl = 'https://lain-the-wired.com/morph/solaris-trons'
    break;
}

cd(gitDir);

await gitPull({
  fs,
  http,
  dir: gitDir,
  url: gitUrl,
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
