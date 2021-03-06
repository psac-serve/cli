import path from "path";
import fse from "fs-extra";

import Module from "./base";

/**
 * Directory Manager module: Manager settings / logs dir.
 */
export default class Directory extends Module {
    public constructor() {
        super("Directory Manager", "Manage settings / logs dir.");
    }

    init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }

    use(): { config: string, save: string, log: string, help: string, mkdirs: () => void } {
        const baseDirectory = path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli");

        return {
            config: path.join(baseDirectory, "psac-client.conf"),
            help: path.join(baseDirectory, "help.db"),
            log: path.join(baseDirectory, "logs"),
            async mkdirs() {
                fse.mkdirsSync(baseDirectory);
                await Promise.all([ fse.createFile(path.join(baseDirectory, "logs", "debug.log")), fse.createFile(path.join(baseDirectory, "logs", "errors.log")) ]);
            },
            save: path.join(baseDirectory, "hosts")
        };
    }
}
