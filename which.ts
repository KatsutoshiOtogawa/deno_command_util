import { parse } from 'flags/mod.ts';
import { join } from 'path/mod.ts';
import { existsSync } from 'fs/mod.ts';
import { envSeparator } from './_runtime.ts';

  
// support
const support_version = [
  "1.36.3", 
  "1.36.4"
];



/** コマンドが一つでもなかったら作成する */
// class  extends Error {
    
// }

function is_support_version (deno_version: string): boolean {
  // 今は動いているが今後動作が変わったら、下を使う。
  return support_version.includes(deno_version);
}

interface Opts {
  all?: boolean,
  /** ネットで探してもほとんど使っている人はいなかったので未実装 */
  read_alias?: boolean
}


// 後で実装
function isExecutable ():boolean {

  // call faccessat 
  return true;
}

/**
 * 
 * @param  {[string, ...string[]]} commands you want to search command. command multi
 * @param {[Opts]} opts command option
 * @returns {Promise<{path: string[], errs: Error[]}>}
 * @throws {Deno.errors.PermissionDenied}
 * 
 */
function whichSync (commands: [string, ...string[]], opts?: Opts): {path: string[], errs: Error[]} {

  let _all = false;
  let _read_alias = false;
  if (opts) {
    const {all, read_alias} = opts;
    if (all !== undefined) {
      _all = all;
    }
    if (read_alias !== undefined) {
      _read_alias = read_alias;
    }
  }

  let path: string[] = [];
  const errs: Error[] = [];

  // パスが読み取り可能かどうかも入れる。
  const search_path_env = Deno.env.get("PATH");

  if (search_path_env === undefined) {
    errs.push(new Deno.errors.AddrNotAvailable("Not Read PATH Environment Variable"));
    return {path, errs}
  }

  // 
  // 有効なパス一覧
  const validated_paths = search_path_env.split(envSeparator()).filter(v => existsSync(v));

  // コマンド単位で検索
  for (const command of commands) {
    // 実行可能かのチェック
    const command_paths = validated_paths
      .map(v => join(v, command));

    let validated: string[] = [];
    // 前検索
    if (_all) {
      validated = command_paths
        .filter(v => existsSync(v) && isExecutable());
    } else {
      const finded = command_paths
        .find(v => existsSync(v) && isExecutable());
      if (finded) {
        validated = [finded];
      }
    }

    if (validated.length === 0) {
      errs.push(new Deno.errors.NotFound(`${command} is not found`));
    } else {
      path = [...path, ...validated];
    }
  }
  return {path, errs}
}

export {
  whichSync 
}

/** main function */
/** 手動チェック用 */
if (import.meta.main) {
    
  const flags = parse(Deno.args, {
    boolean: ["all", "read_alias"],
  });
  
  const commands: string[] = [];

  for (const arg of Deno.args) {
    // -か--が出るまではstring
    if (arg.startsWith('-') || arg.startsWith('--')) {
      break;
    }
    commands.push(arg)
  }

  if (commands.length === 0) {
    throw new Deno.errors.UnexpectedEof("command assign");
  }

  try {
    const result = whichSync(commands as [string, ...string[]], flags);
    console.log(result);
  } catch (err) {
    console.log(err)
  }
}
