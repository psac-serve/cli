import ModuleManager from "./modules/manager";

import Directory from "./modules/directory";
import Client from "./modules/client";
import Command from "./modules/command";
import Prompt from "./modules/prompt";
import Help from "./modules/help";

let flags: { [key: string]: unknown } = {};
let arguments_: { [key: string]: unknown } = {};

export class ModuleManagerInstance {
    static register(_flags: { [key: string]: unknown }, _arguments: { [key: string]: unknown }): void {
        [ flags, arguments_ ] = [ _flags, _arguments ];
    }
}

export { flags, arguments_ };

export default new ModuleManager([
    new Directory(),
    new Help(),
    new Client(),
    new Command(),
    new Prompt()
]);
