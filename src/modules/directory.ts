import path from "path";
import fse from "fs-extra";

import Module from "./base";

export default class Directory extends Module 
{
    constructor() 
    {
        super("Directory Manager", "Manage settings / logs dir.");
    }

    init(): Promise<void> 
    {
        this.enabled = true;

        return Promise.resolve();
    }

    close(): Promise<void> 
    {
        this.enabled = false;

        return Promise.resolve();
    }

    use(): { config: string, save: string, log: string, mkdirs: () => void } 
    {
        const baseDirectory = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli");

        return {
            config: path.join(baseDirectory, "psac-client.conf"),
            save: path.join(baseDirectory, "hosts"),
            log: path.join(baseDirectory, "logs"),
            mkdirs: () => 
            {
                fse.mkdirsSync(baseDirectory);
                fse.createFileSync(path.join(baseDirectory, "logs", "debug.log"));
                fse.createFileSync(path.join(baseDirectory, "logs", "errors.log"));
            }
        };
    }
}
