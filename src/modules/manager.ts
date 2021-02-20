import path from "path";
import zlib from "zlib";
import chalk from "chalk";
import fse from "fs-extra";
import msgpack from "msgpack-lite";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";
import { terminal } from "terminal-kit";

import { arguments_, flags } from "../manager-instance";

import ModuleNotFoundError from "../errors/module-not-found";

import parseHostname from "../utils/hostname";

import Module from "./base";
import Logger from "./native/logger";
import Clients from "./native/clients";

/**
 * The module manager to manage cli modules.
 */
export default class ModuleManager {
    /**
     * Module Manager Native Logger System (MMNLS).
     */
    public logger: Logger | Record<string, any> = {}
    /**
     * Module Manager Native Session Manager (MMNSM).
     */
    public sessions: Clients | Record<string, any> = {}
    /**
     * Integration from {@link Prompt}.
     */
    public prompting = false
    /**
     * Integration from {@link Prompt}.
     */
    public promptCount = 0
    /**
     * Event-based dynamic columns.
     */
    public columns = process.stdout.columns

    /**
     * Constructor.
     *
     * @param _modules - The modules to use. All modules is disabled first.
     *
     * @returns The instance of this class.
     */
    public constructor(private _modules: Module[] = []) {
        terminal.on("resize", (width: number) => {
            this.columns = width;
        });
    }

    /**
     * Encapsulated _modules value.
     */
    public get modules(): Module[] {
        return this._modules;
    }

    /**
     * Adds new module to loaded modules.
     *
     * @param module - A module to load.
     *
     * @returns This method is able to chain.
     */
    load(module: Module | Module[]): ModuleManager {
        if (module instanceof Module) {
            this._modules.push(module);
            this.initModule(module).then(value => value)["catch"]((error) => {
                throw error;
            });
        } else {
            this.modules.push(...module);

            Promise.all(module.map(element => this.initModule(element))).then(value => value)["catch"]((error) => {
                throw error;
            });
        }

        return this;
    }

    /**
     * Call use() from specified module.
     *
     * @param name - Module name to call.
     *
     * @returns Result of specified module's use().
     */
    use(name: string | Module): any {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) {
            throw new ModuleNotFoundError();
        }

        while (!this.modules[index].enabled) {
            if (process.env.DEBUG === "1") {
                console.log("Enabling " + this.modules[index].name);
            }
        }

        return this.modules[index].use();
    }

    /**
     * Initialize all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async initAllModules(): Promise<void> {
        this.logger = new Logger();

        if (!fse.existsSync(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts"))) {
            this.logger.info(sprintf(__("Hosts configuration not found, creating new file with mode %s."), chalk.blueBright("0600")), !!flags.verbose);
            await fse.writeFile(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts"), zlib.brotliCompressSync(msgpack.encode([])));
            await fse.chmod(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts"), 0o600);
        }

        this.sessions = new Clients();

        await this.sessions.createSession("main", parseHostname(arguments_.hostname as string), !!flags.token, !!flags.raw, !!flags["ignore-test"], true);

        await Promise.all(this.modules.map(module => module.init()));
    }

    /**
     * Close all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async closeAllModules(): Promise<void> {
        this.sessions.closeAllSession();

        await Promise.all(this.modules.map(module => module.close()));
    }

    /**
     * Initialize specified module.
     *
     * @returns Promise class to use await / .then().
     */
    async initModule(name: string | Module): Promise<void> {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) {
            throw new ModuleNotFoundError();
        }

        return await this.modules[index].init();
    }

    /**
     * Close specified module.
     *
     * @returns Promise class to use await / .then().
     */
    async closeModule(name: string | Module): Promise<void> {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) {
            throw new ModuleNotFoundError();
        }

        return await this.modules[index].close();
    }
}

