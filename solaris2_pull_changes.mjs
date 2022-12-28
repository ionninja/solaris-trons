#!/usr/bin/env tron

// обновляет git-репозиторий для указанной цели (флаг `-t`).

import { pull as gitPull } from "isomorphic-git";
import * as http from "isomorphic-git/http/node/index.cjs";
import fs from "node:fs";

$.verbose = false;

const oldCwd = process.cwd();

let gitDir;
switch (argv.t) {
  case 'code':
    gitDir = '/share/app/code';
    break;
  case 'share':
    gitDir = '/share';
    break;
  case 'trons':
    gitDir = '/opt/solaris-trons';
    break;
  default:
    console.error(`Unknown target: ${argv.t}`);
    process.exit(1);
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

if (argv.t !== 'trons') {
  const result = await $`${path.join(__dirname, "solaris2_post_process.mjs")}`.nothrow();
  if (result.exitCode === 0) {
    console.log("ok");
  } else {
    console.log(result.stderr.trim())
  }
}


cd(oldCwd);