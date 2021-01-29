import ModuleManager from "./modules/manager";

import Directory from "./modules/directory";
import Client from "./modules/client";
import Command from "./modules/command";
import Prompt from "./modules/prompt";
import Help from "./modules/help";

let managerInstance: ModuleManager = new ModuleManager([]);
let flags: { [key: string]: unknown } = {};
let arguments_: { [key: string]: unknown } = {};

export class ModuleManagerInstance {
    static register(_flags: { [key: string]: unknown }, _arguments: { [key: string]: unknown }): void {
        managerInstance = new ModuleManager([
            new Directory(),
            new Client(),
            new Command(),
            new Prompt(),
            new Help()
        ]);

        [ flags, arguments_ ] = [ _flags, _arguments ];
    }
}

export { flags, arguments_ };

export default managerInstance;
