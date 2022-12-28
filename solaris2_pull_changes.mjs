#!/usr/bin/env tron

import { runInternalScript } from './common.mjs';
import { pull as gitPull } from "isomorphic-git";
import * as http from "isomorphic-git/http/node/index.cjs";
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
  onAuth(u) {
    return {
      username: 'morph',
      password: 'glpat-pH8rxCGGi-pqfxMdsKqb'
    }
  },
  fs,
  http,
  dir: gitDir,
  ref: 'master',
  singleBranch: true,
  author: {
    name: 'morph',
    email: 'hpromatem@protonmail.com'
  },
  oauth2format: 'gitlab'
});

await runInternalScript("solaris2_post_process.mjs");

cd(oldCwd);