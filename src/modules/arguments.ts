import path from "path";
import chalk from "chalk";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import figures from "figures";
import { sprintf } from "sprintf-js";
import terminalLink from "terminal-link";
import { __ } from "i18n";

import Module from "./base";

/**
 * An argument manager module to manage command-line arguments.
 */
export default class Arguments extends Module {
    constructor(private _usage: string = commandLineUsage([{
        header: "Minecraft Ban Manager Client",
        content: __("A client application of the server to manage Minecraft's ban / kick records.")
    }, {
        header: "Usage",
        content: `$ ${path.basename(__filename)} -[Vvti] [-s [File]] [-h] <Hostname>`
    }, {
        header: "Options",
        optionList: [{
            name: "version",
            alias: "V",
            description: __("Show the version."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "verbose",
            alias: "v",
            description: __("Enable verbose logging."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "token",
            alias: "t",
            description: __("Connect to the server with a token."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "host",
            alias: "h",
            description: __("Specify the host to connect. If you not specified the port, the client connects with port 810 (example.com:810)."),
            type: String
        }, {
            name: "ignore-test",
            alias: "i",
            description: __("Ignore connection testing when starts the client."),
            type: Boolean,
            defaultValue: false
        }, {
            name: "help",
            alias: "?",
            description: __("Show this usage guide.")
        }]
    }, {
        content: sprintf(__("Project home: %s"), terminalLink("Github", "https://github.com/psac-serve/cli"))
    }]), private _arguments = commandLineArgs([{
        name: "version",
        alias: "V",
        type: Boolean,
        defaultValue: false
    }, {
        name: "verbose",
        alias: "v",
        type: Boolean,
        defaultValue: false
    }, {
        name: "token",
        alias: "t",
        type: Boolean,
        defaultValue: false
    }, {
        name: "host",
        alias: "h",
        type: String,
        defaultOption: true
    }, {
        name: "ignore-test",
        alias: "i",
        type: Boolean,
        defaultValue: false
    }, {
        name: "help",
        alias: "?",
        type: Boolean,
        defaultValue: false
    }]) as {
        version: boolean,
        verbose: boolean,
        token: boolean,
        host: string,
        "ignore-test": boolean,
        help: boolean
    }) {
        super("Arguments Manager", "Manage command-line arguments to show usage, arguments, and parse.");
    }

    init(): Promise<void> {
        if (this._arguments.version) {
            console.log("v0.1.0");
            process.exit(0);
        }

        if (this._arguments.help) {
            console.log(this._usage);
            process.exit(0);
        } else if (!("host" in this._arguments)) {
            console.log(chalk`{red ${figures.cross} {underline error} ${__("Host not found in the arguments!")}}`);
            console.log(this._usage);
            process.exit(1);
        }

        this.enabled = true;

        return Promise.resolve();
    }

    close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }

    use(): { version: boolean, verbose: boolean, token: boolean, host: string, "ignore-test": boolean, help: boolean } {
        return this._arguments;
    }
}

