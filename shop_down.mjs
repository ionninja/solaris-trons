#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();

cd(path.join(SOLARIS_PROJECTS_PATH, argv._[0]));
let result = await $`./docker-compose.sh down`.nothrow();
if (result.exitCode === 0) {
  console.log(YAML.stringify({ [shop]: argv._[0] }));
} else {
  console.error(YAML.stringify({ [shop]: { name: argv._[0], error: result.stderr } }));
}

cd(oldCwd);