import { assertEquals,  assertIsError  } from "assert/mod.ts";
import { whichSync } from './which.ts';

// whichは探したコマンドが見つかるとフルパスで返す
Deno.test(function singleTest() {
  
  const result = whichSync(["cat"]);
  assertEquals(result.path[0], "/bin/cat");
  // 成功したので空の配列
  assertEquals(result.errs, []);
});

// whichは環境変数PATHの中に存在しないパスが含まれていてもエラーにならない
Deno.test(function single2Test() {
  
  const result = whichSync(["cat"]);
  assertEquals(result.path[0], "/bin/cat");
  // 成功したので空の配列
  assertEquals(result.errs, []);
});

// 存在しないコマンドを与えるとエラーを引数として返す
Deno.test(function singleNotFoundTest() {
  
  const result = whichSync(["Notfound"]);

  assertEquals(result.path.length, 0);
  assertIsError(result.errs[0])
});

// which は複数のコマンドを複数の引数を持てる
Deno.test(function multiTest() {
  
  const result = whichSync(["cat", "ls", "env"]);
  assertEquals(result.path[0], "/bin/cat");
  assertEquals(result.path[1], "/bin/ls");
  assertEquals(result.path[2], "/usr/bin/env");
  assertEquals(result.path.length, 3);

  // 成功したので空の配列
  assertEquals(result.errs, []);
});

// 一つでも見つからないコマンドを発見したら、エラー
Deno.test(function multiNotFoundTest() {
  
  const result = whichSync(["cat", "NotFound"]);
  assertEquals(result.path[0], "/bin/cat");
  assertEquals(result.path.length, 1);
  assertIsError(result.errs[0])

  const result2 = whichSync(["cat", "ls", "NotFound"]);
  assertEquals(result2.path[0], "/bin/cat");
  assertEquals(result2.path[1], "/bin/ls");
  assertEquals(result2.path.length, 2);
  assertIsError(result2.errs[0])

  // 存在しなかった分だけエラー
  const result3 = whichSync(["cat", "NotFound", "NotFound2"]);
  assertEquals(result3.path[0], "/usr/bin/cat");
  assertEquals(result3.path.length, 1);
  assertEquals(result3.errs.length, 2);
  assertIsError(result3.errs[0])
  assertIsError(result3.errs[1])
});

// setfacl -R -m u:vscode:r

// whichファイルの存在確認と実行権限確認。
// if [ -f "$ELEMENT/$PROGRAM" ] && [ -x "$ELEMENT/$PROGRAM" ]; then
//      puts "$ELEMENT/$PROGRAM"
//      RET=0
//      [ "$ALLMATCHES" -eq 1 ] || break
//     fi


// which の仕様としてPATHに存在しなパスが合ってもエラーにならない。

// そのユーザーに対してacl含むファイルのパーミッション的に実行可能出ないと表示しない。
// 例えば、rootユーザーのみに実行権限が合って、通常ユーザーに実行権限がないならwhichに表示されない。

// acl的に実行できるかも必要になる。

// o+xなら実行可能,u+xならファイルの所有者を見れば良い

// windowsの仕様に合わせず、which として動作する拡張子を勝手に補完しない
// windowsの仕様に合わせるならwhereを使う。
