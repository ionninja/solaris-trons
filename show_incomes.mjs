#!/usr/bin/env tron

import { SOLARIS_PROJECTS_PATH } from './common.mjs';

$.verbose = false;

//const CMD = `./docker-compose.sh exec database mysql -t -uroot -prootpassword database "${@:2}" -e "select sum(amount_btc) from incomes;" -N`;

const oldCwd = process.cwd();
cd(SOLARIS_PROJECTS_PATH);

if (argv._.length === 0) {
} else {
}
console.log(argv);


cd(oldCwd);

/*
const defaultType = 'ed25519';
const defaultBits = 3072;
const type = argv.type ?? defaultType;
const outDir = `/tmp/${radash.uid(7)}`;
const keyfile = `${outDir}/id_${type}`;
const keypass = argv.keypass ?? radash.uid(16)

await $`mkdir ${outDir}`.nothrow();
const result = await $`ssh-keygen -o -C ${argv.comment ? argv.comment : "gen_by_tron_" + Math.floor(Date.now() / 1000)} -t ${type} -b ${argv.bits ?? defaultBits} -f ${keyfile} -N ${keypass}`.nothrow();
if (result.exitCode !== 0) {
  console.error(YAML.stringify({ ...result }));
} else {
  const privatekey = (await fs.readFile(keyfile)).toString();
  const publickey = (await fs.readFile(`${keyfile}.pub`)).toString()
  console.log(YAML.stringify({
    type,
    keypass,
    privatekey,
    publickey
  }));
}

await $`rm -rf ${outDir}`.nothrow();
*/
