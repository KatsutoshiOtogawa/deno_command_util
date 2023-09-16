
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

export {
    isWindows,
    envSeparator
}