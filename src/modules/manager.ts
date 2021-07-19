import { existsSync } from "https://x.nest.land/std@0.101.0/fs/mod.ts";
import { join } from "https://x.nest.land/std@0.101.0/path/mod.ts";

import { sprintf } from "https://x.nest.land/std@0.101.0/fmt/printf.ts";

import dataDir from "https://deno.land/x/data_dir@v0.1.0/mod.ts";

import { compress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { pack } from "https://deno.land/x/msgpackr@v1.3.2/index.js";

import { t } from "../translate.ts";

import ModuleNotFoundError from "../errors/module-not-found.ts";

import Module from "./base.ts";
import { Clients } from "../clients.ts";

import { columns } from "../console/size.ts";

import { getLogger, Logger } from "../logger/logger.ts";
import { flags } from "../main.ts";

/**
 * The module manager to manage cli modules.
 */
export class ModuleManager {
    /**
     * Module Manager Native Session Manager (MMNSM).
     */
    public sessions?: Clients | undefined;

    /**
     * Integration from {@link Prompt}.
     */
    public prompting = false;
    /**
     * Integration from {@link Prompt}.
     */
    public promptCount = 0;
    /**
     * Event-based dynamic columns.
     */
    public columns = columns;

    /**
     * ModuleManager's logger.
     */
    public logger: Logger;

    /**
     * Constructor.
     *
     * @returns The instance of this class.
     */
    public constructor() {
        this.logger = getLogger("modules");

        Deno.mkdirSync(join(dataDir() || ".", "psac"), { recursive: true });

        const hostsFile = join(dataDir() || ".", "psac", "hosts");

        if (!(existsSync(hostsFile))) {
            this.logger.info(sprintf(t("manager.hosts.not-found"), '"0600"'));

            Deno.writeFileSync(hostsFile, compress(pack([])),
                { append: true, create: true });
            Deno.chmodSync(hostsFile, 0o600);
        }
    }

    /**
     * The modules to use. All modules is disabled first.
     * @private
     */
    private _modules: Module[] = [];

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
    async load(module: Module | Module[]): Promise<ModuleManager> {
        if (module instanceof Module) {
            this._modules.push(module);

            try {
                await this.initModule(module);
            } catch (error) {
                throw error;
            }
        } else {
            this.modules.push(...module);

            try {
                await Promise.all(module.map(element => this.initModule(element)))
            } catch (error) {
                throw error;
            }
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
    // deno-lint-ignore no-explicit-any
    use(name: string | Module): any {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
                                               : this.modules.indexOf(name);

        if (index == -1) {
            throw new ModuleNotFoundError();
        }

        return this.modules[index].use();
    }

    /**
     * Initialize all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async initAllModules(hostname: string): Promise<void> {
        this.sessions = new Clients();

        await this.sessions.createSession(
            "main",
            hostname,
            flags.useToken,
            !flags.compress,
            flags.ignoreTest,
            true
        );

        await Promise.all(this.modules.map(module => module.init()));
    }

    /**
     * Close all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async closeAllModules(): Promise<void> {
        this.sessions?.closeAllSession();

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

export const manager = new ModuleManager();
