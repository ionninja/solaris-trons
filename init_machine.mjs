#!/usr/bin/env tron

$.verbose = false;

if (!argv.skipUpgrade) {
  await $`apt update`;
  await $`apt -y upgrade`;
}

if (argv.hostname) {
  const oldHostname = (await $`hostname`).trim();
  await `hostname ${argv.hostname}`;
  await $`sed -i 's/${oldHostname}/${argv.hostname}/g' /etc/hostname`;
  await $`sed -i 's/${oldHostname}/${argv.hostname}/g' /etc/hosts`;
  const newHostname = (await $`hostnamectl`).split('\n')[0].split(': ')[1].trim();
  if (newHostname == argv.hostname) {
    console.log(`hostname successfully changed to ${argv.hostname}`);
  }
}
