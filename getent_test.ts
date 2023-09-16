import { assertEquals,  assertIsError  } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { getent } from './getent.ts';
import { readLines } from 'io/mod.ts';

// passwdで欲しいユーザーが取得できるかチェック
Deno.test(async function passwdTest() {
  
  const result = await getent('passwd', 'root');
  assertEquals(result.entry[0].split(":")[0], "root");

  // dbのentryは下記のようになるが、デフォルトのシェルは環境に依存するので、
  // シェルの手前までの値で判断
  // "root:x:0:0:root:/root:/bin/bash"
  assertEquals(result.entry[0].split("/")[0], "root:x:0:0:root:");
  // 成功したのでundefined
  assertEquals(result.err, undefined);
});

// passwdでキーを指定しない場合はユーザーがすべて取得できるかチェック
Deno.test(async function passwdAllTest() {
  
  const result = await getent('passwd');

  // 実際にファイルを開いて比較する
  const file = await Deno.open("/etc/passwd", {read: true});
    // for  (const line of await Deno.readTextFile(database_path)) {
    // typescript 5.2対応になったらusingで書き換える
  let i = 0;
  for await (const line of readLines(file)) {
    assertEquals(result.entry[i], line);
    i++;
  }
  file.close();
  assertEquals(result.err, undefined);
});

// groupで欲しいユーザーが取得できるかチェック
Deno.test(async function groupTest() {
  
  const result = await getent('group', 'root');
  assertEquals(result.entry[0].split(":")[0], "root");

  // 成功したのでundefined
  assertEquals(result.err, undefined);
});

// passwdでキーを指定しない場合はユーザーがすべて取得できるかチェック
Deno.test(async function groupAllTest() {
  
  const result = await getent('group');

  // 実際にファイルを開いて比較する
  const file = await Deno.open("/etc/group", {read: true});
    // for  (const line of await Deno.readTextFile(database_path)) {
    // typescript 5.2対応になったらusingで書き換える
  let i = 0;
  for await (const line of readLines(file)) {
    assertEquals(result.entry[i], line);
    i++;
  }
  file.close();
  assertEquals(result.err, undefined);
});
