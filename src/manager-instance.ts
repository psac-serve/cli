import ModuleManager from "./modules/manager";

import Directory from "./modules/directory";
import Command from "./modules/command";
import Prompt from "./modules/prompt";
import Help from "./modules/help";

/**
 * The command flags.
 *
 * If you run with this flags:
 * ```bash
 * -rt
 * ```
 * internal system convert to:
 * ```typescript
 * {
 *    raw: true,
 *    token: true
 * }
 * ```
 *
 * More flags information is: {@link BanClient.flags}
 */
let flags: { [key: string]: unknown } = {};
/**
 * The command arguments.
 *
 * If you run with:
 * ```bash
 * $ node bin/run 127.0.0.1
 * ```
 * internal system convert to:
 * ```typescript
 * {
 *     hostname: "127.0.0.1"
 * }
 * ```
 *
 * More flags information is: {@link BanClient.args}
 */
let arguments_: { [key: string]: unknown } = {};

/**
 * The static class of Module Manager.
 *
 * Internal system uses this, **do not use this class.**
 */
export class ModuleManagerInstance {
    static register(_flags: { [key: string]: unknown }, _arguments: { [key: string]: unknown }): void {
        [ flags, arguments_ ] = [ _flags, _arguments ];
    }
}

export { flags, arguments_ };

export default new ModuleManager([
    new Directory(),
    new Help(),
    new Command(),
    new Prompt()
]);
