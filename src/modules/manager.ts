import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import { flags } from "../manager-instance";

import ModuleNotFoundError from "../errors/module-not-found";

import Module from "./base";
import Logger from "./native/logger";

/**
 * The module manager to manage cli modules.
 */
export default class ModuleManager 
{
    /**
     * Constructor.
     *
     * @param _modules The modules to use. All modules is disabled first.
     *
     * @param logger Module Manager native logger.
     * @returns The instance of this class.
     */
    constructor(private _modules: Module[] = [], public logger = new Logger()) 
    {}

    /**
     * Encapsulated _modules value.
     */
    get modules(): Module[] 
    {
        return this._modules;
    }

    /**
     * Adds new module to loaded modules.
     *
     * @param module A module to load.
     *
     * @returns This method is able to chain.
     */
    load(module: Module | Module[]): ModuleManager 
    {
        if (module instanceof Module) 
        {
            this._modules.push(module);
            this.initModule(module).then(value => value)["catch"]((error) => 
            {
                throw error;
            });
        }
        else 
        {
            this.modules.push(...module);

            Promise.all(module.map(element => this.initModule(element))).then(value => value)["catch"]((error) => 
            {
                throw error;
            });
        }

        return this;
    }

    /**
     * Call use() from specified module.
     *
     * @param name Module name to call.
     *
     * @returns Result of specified module's use().
     */
    use(name: string | Module): any 
    {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) 
        
            throw new ModuleNotFoundError();
        

        const foundName = name instanceof Module ? name.name : name;

        if (!this.modules[index].enabled) 
        
            this.logger.info(sprintf(__("Module %s is disabled. Waiting..."), foundName), !!flags.verbose, `manager.use - ${name instanceof Module ? name.name : name}`);
        

        while (!this.modules[index].enabled) 
        
            if (process.env.DEBUG === "1") 
            
                console.log("Enabling " + this.modules[index].name);
            
        

        if (flags.verbose) 
        {
            process.stdout.moveCursor(0, -1);
            process.stdout.cursorTo(0);
            process.stdout.clearLine(0);
        }

        this.logger.success(sprintf(__("Module %s is enabled. Getting data and returning..."), foundName), !!flags.verbose, `manager.use - ${name instanceof Module ? name.name : name}`);

        return this.modules[index].use();
    }

    /**
     * Initialize all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async initAllModules(): Promise<void> 
    {
        await Promise.all(this.modules.map(module => module.init()));
    }

    /**
     * Close all loaded modules.
     *
     * @returns Promise class to use await / .then().
     */
    async closeAllModules(): Promise<void> 
    {
        await Promise.all(this.modules.map(module => module.close()));
    }

    /**
     * Initialize specified module.
     *
     * @returns Promise class to use await / .then().
     */
    async initModule(name: string | Module): Promise<void> 
    {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) 
        
            throw new ModuleNotFoundError();
        

        return await this.modules[index].init();
    }

    /**
     * Close specified module.
     *
     * @returns Promise class to use await / .then().
     */
    async closeModule(name: string | Module): Promise<void> 
    {
        const index = typeof name === "string" ? this.modules.map(module => module.name).indexOf(name)
            : this.modules.indexOf(name);

        if (index == -1) 
        
            throw new ModuleNotFoundError();
        

        return await this.modules[index].close();
    }
}

