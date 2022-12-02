#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

const oldCwd = process.cwd();
const scriptsPath = __dirname;

let shops;
if (argv._.length === 0) {
  const result = await $`${path.join(scriptsPath, "list_shops.mjs")}`.nothrow();
  if (result.exitCode !== 0) {
    process.exit(1);
  } else {
    shops = YAML.parse(result.stdout);
  }
} else {
  shops = argv._;
}

const result = {};
for (const shop of shops) {
  cd(path.join(SOLARIS_PROJECTS_PATH, shop));

  const mysqlResult = await $`${path.join(SOLARIS_PROJECTS_PATH, shop, 'docker-compose.sh')} exec database mysql -t -uroot -prootpassword database "\${@:2}" -e "select sum(amount_btc) from incomes;" -N`.nothrow();
  if (mysqlResult.exitCode === 0) {
    const regex = new RegExp(/[+-]?([0-9]*[.])?[0-9]+/);
    const matchResult = regex.exec(mysqlResult.stdout);
    if (matchResult && matchResult.length > 0) {
      result[shop] = matchResult[0];
    } else {
      result[shop] = null;
    }
  } else {
    result[shop] = `exit:${mysqlResult.exitCode}`;
  }
}

cd(oldCwd);

console.log(YAML.stringify(result));
