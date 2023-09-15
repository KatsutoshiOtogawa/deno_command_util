
import { globToRegExp, extname,join } from 'path/mod.ts';
import { walk, exists, existsSync } from 'fs/mod.ts';

// const pathExtText = environment.env("PATHEXT") ?? ".EXE;.CMD;.BAT;.COM";
  
/** runtime 環境下でwindowsかどうかの確認に使う。 */
const isWindows = Deno.build.os === "windows";

/**
 * 
 * @returns {":" | ";"} runtime環境下のセパレーターを返します。
 */
function envSeparator (): ":" | ";" {
    if (isWindows) {
        return ";";
    }

    return ":";
}

class NotSupportedPlatform extends Error {
    
}

class NotSupportedVersion extends Error {

}

// Deno.version.deno

// support
const support_version = [
    "1.36.3", 
    "1.36.4"
];

/** コマンドが一つでもなかったら作成する */
// class  extends Error {
    
// }

function is_support_version (_deno_version: string): boolean {

    return true;

    // 今は動いているが今後動作が変わったら、下を使う。
    // return support_version.includes(deno_version);
}

interface Opts {
    all?: boolean,
    read_alias?: boolean
};


// 後で実装
function isExecutable ():boolean {

    // call faccessat 

    return true;
}

/**
 * 
 * @param  {[string, ...string[]]} commands you want to search command. command multi
 * @param {[Opts]} opts command option
 * @returns {Promise<{path: string[], err?: Error}>}
 * 
 */
function whichSync (commands: [string, ...string[]], opts?: Opts): {path: string[], err?: Error} {

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
    let err: Error | undefined = undefined;

    // パスが読み取り可能かどうかも入れる。
    const search_path_env = Deno.env.get("PATH");

    if (search_path_env === undefined) {
        err = new Error("Not Read PATH Environment Variable");
        return {path, err}
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

            err = new Error(`${command} is not found`);
        } else {
            path = [...path, ...validated];
        }
    }

    // コマンドごとに検索をかけるのasyncループ

    // コマンドごとに検索

    // インデックスが最初のパスから検索する
    // パスの存在チェックを前に入れる。

    return {path, err}
// 存在しない場合はerrorにしたいなら引数に渡す。
    // if (isWindows) {
    //     console.log("windows")
    // } else {

    // }
    // return "";
}

export {
    whichSync 
}