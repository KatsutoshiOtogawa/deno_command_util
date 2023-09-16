import { join } from 'path/mod.ts';
import { existsSync, exists } from 'fs/mod.ts';
import { readLines } from 'io/mod.ts';
// import { isWindows } from './_runtime.ts';

// One of the following exit values can be returned by getent:

// 0      Command completed successfully.

// 1      Missing arguments, or database unknown.

// 2      One or more supplied key could not be found in the database.

// 3      Enumeration not supported on this database.

type Database =
  "ahosts"   |
  "ahostsv4" |
  "ahostsv6" |
  "aliases" |
  "ethers" |
  "group" |
  "gshadow" |
  "hosts" |
  "initgroups" |
  "netgroup" |
  "networks" |
  "passwd" |
  "protocols" |
  "services" |
  "shadow";

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

async function getPasswd (key?: string, opts?: Opts): Promise<{ entry: string[]; err?: Error|undefined; }> {

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
    const entry: string[] = [];
    let err: Error | undefined = undefined;
    // "/"
    const database_path = join("/", "etc", "passwd");
    if (! await exists(database_path)) {
        err = new Error("passwd is not Found this filesystem.");
        return {entry, err};
    }
    const file = await Deno.open(database_path, {read: true});
    // for  (const line of await Deno.readTextFile(database_path)) {
    // typescript 5.2対応になったらusingで書き換える
    for await (const line of readLines(file)) {
        if (key) {
            if (key === line.split(":")[0]) {
                entry.push(line);
                break;
            }
        } else {
            entry.push(line);
        }
    }
    file.close();

    if (!entry) {
        err = new Error("${database} seen Not Found Entry");
    }

    return {entry, err}
}

async function getGroup (key?: string, opts?: Opts): Promise<{ entry: string[]; err?: Error|undefined; }> {

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
    const entry: string[] = [];
    let err: Error | undefined = undefined;
    const database_path = join("/", "etc", "group");
    if (! await exists(database_path)) {
        err = new Error("group is not Found this filesystem.");
        return {entry, err};
    }
    // for  (const line of await Deno.readTextFile(database_path)) {
    const file = await Deno.open(database_path, {read: true});
    
    // for  (const line of readLines(database_path)) {
    for await (const line of readLines(file)) {
        if (key) {
            if (key === line.split(":")[0]) {
                entry.push(line);
                break;
            }
        } else {
            entry.push(line);
        }
    }
    file.close();

    if (!entry) {
        err = new Error("group seen Not Found Entry");
    }

    return {entry, err}
}

/**
 * 
 * @param  {[string, ...string[]]} commands you want to search command. command multi
 * @param {[Opts]} opts command option
 * @returns {Promise<{path: string[], err?: Error}>}
 * 
 */
function getent (database: Database, key?: string, opts?: Opts): Promise<{ entry: string[]; err?: Error|undefined; }> {

// 存在しない場合はerrorにしたいなら引数に渡す。
    // if (isWindows) {
    //     console.log("windows")
    // } else {

    // }
    // return "";
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

    let entris:Promise<{
        entry: string[];
        err?: Error | undefined;
    }>;

    switch (database) {
        case "passwd":
            entris = getPasswd(key, opts);
            break;
        case "group":
            entris = getGroup(key, opts);
            break;
        default:
            throw Error("Unimplemented");
    }

    return entris;
}

export {
    getent
}
