import { parse } from 'flags/mod.ts';
import { join } from 'path/mod.ts';
import { existsSync, exists } from 'fs/mod.ts';
import { readLines } from 'io/mod.ts';
// import { isWindows } from './_runtime.ts';

// One of the following exit values can be returned by getent:

// 0      Command completed successfully.

// 1      Missing arguments, or database unknown.

// 2      One or more supplied key could not be found in the database.

// 3      Enumeration not supported on this database.

const _Database = [
  "ahosts",  
  "ahostsv4" ,
  "ahostsv6" ,
  "aliases" ,
  "ethers" ,
  "group" ,
  "gshadow" ,
  "hosts" ,
  "initgroups" ,
  "netgroup" ,
  "networks" ,
  "passwd" ,
  "protocols" ,
  "services" ,
  "shadow"
] as const;

type Database = typeof _Database[number];

/**
 * Type 
 * @param {string} database you want to check string
 */
function database_type_guard(database: string): database is Database{
  return _Database.includes(database as Database);
}

function is_support_version (_deno_version: string): boolean {

    return true;

    // 今は動いているが今後動作が変わったら、下を使う。
    // return support_version.includes(deno_version);
}

interface Opts {
  all?: boolean,
  read_alias?: boolean
}


// 後で実装
function isExecutable ():boolean {

  // call faccessat 

  return true;
}

async function _getPasswd (key?: string, opts?: Opts): Promise<{ entry: string[]; err?: Error|undefined; }> {

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
    err = new Error(`${key} seen Not Found Entry`);
  }

  return {entry, err}
}

/**
 * 
 * @param {[string]} key 
 * @param {[Opts]} opts 
 * @returns {Promise<{ entry: string[]; err?: Error|undefined; }>}
 */
async function _getGroup (key?: string, opts?: Opts): Promise<{ entry: string[]; err?: Error|undefined; }> {

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
    err = new Deno.errors.NotFound("group is not Found this filesystem.");
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
    err = new Deno.errors.NotFound("group seen Not Found Entry");
  }

  return {entry, err}
}

/**
 * 
 * @param  {[string, ...string[]]} database you want to search command. command multi
 * @param  {[string]} key you want to search command. command multi
 * @param {[Opts]} opts command option
 * @returns {Promise<{path: string[], err?: Error}>}
 * @throws {Deno.errors.PermissionDenied | Deno.errors.NotSupported}
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
      entris = _getPasswd(key, opts);
      break;

    case "group":
      entris = _getGroup(key, opts);
      break;

    case "ahosts":
    case 'ahostsv4':
    case 'ahostsv6':
    case 'aliases':
    case 'ethers':
    case 'gshadow':
    case 'hosts':
    case 'initgroups':
    case 'netgroup':
    case 'networks':
    case 'protocols':
    case 'services':
    case 'shadow':
      throw new Deno.errors.NotSupported("Not supported database");

    default:
      throw new Deno.errors.NotSupported("Not supported database");
  }

  return entris;
}

export {
  type Database,
  getent,
  database_type_guard
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

  if (!database_type_guard(commands[0])) {
    throw new TypeError("This is not database.");
  }

  const database = commands[0] as Database;

  const key = commands[1];
  try {
    const result = await getent(database, key, flags);
    console.log(result);
  } catch (err) {
    console.log(err)
  }
}
