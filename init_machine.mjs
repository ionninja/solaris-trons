#!/usr/bin/env tron

$.verbose = false;

if (!argv.skipUpgrade) {
  await $`apt update`;
  await $`apt -y upgrade`;
  await $`apt install -y unzip curl`;
}

if (!argv.skipMc) {
  await $`apt install -y mc`;
  console.log(`mc: ok`);
}

if (argv.hostname) {
  const oldHostname = (await $`hostname`.nothrow()).stdout.trim();
  if (oldHostname !== argv.hostname) {
    await $`hostname ${argv.hostname}`;
    await $`sed -i 's/${oldHostname}/${argv.hostname}/g' /etc/hostname`;
    await $`sed -i 's/${oldHostname}/${argv.hostname}/g' /etc/hosts`;
    const newHostname = (await $`hostnamectl`).stdout.split('\n')[0].split(': ')[1].trim();
    if (newHostname == argv.hostname) {
      console.log(`hostname: ${argv.hostname}`);
    }
  }
}

// Установка клиента netmaker
await $`curl -sL 'https://apt.netmaker.org/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/netclient.asc`;
await $`curl -sL 'https://apt.netmaker.org/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/netclient.list`;
await $`sudo apt update`;
await $`sudo apt install netclient`;
console.log(`netclient: ok`);