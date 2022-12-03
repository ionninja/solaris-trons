#!/usr/bin/env tron

// Скрипт возвращает карту аккаунтов и их балансов в YAML-формате.s

$.verbose = false;

let accounts = {};
const listAccountsResult = await $`bitcoin-cli -conf=/share/bitcoin.conf listaccounts`;
if (listAccountsResult.exitCode === 0) {
  accounts = JSON.parse(listAccountsResult.stdout);
}

console.log(YAML.stringify(accounts));
