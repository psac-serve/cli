import fs from "fs";
import zlib from "zlib";
import axios, { AxiosInstance } from "axios";
import chalk from "chalk";
import figures from "figures";
import fse from "fs-extra";
import msgpack from "msgpack";
import { prompt } from "enquirer";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import Timer from "../utils/timer";

import { arguments_, default as manager, flags } from "../manager-instance";

import ModuleNotEnabledError from "../errors/module-not-enabled";

import Module from "./base";

/**
 * The core module to using this application.
 */
export default class Client extends Module 
{
    /**
     * Constructor.
     *
     * @param client The axios instance to use interceptors.
     * @param saveFile
     * @param paths
     * @param hostname
     *
     * @returns The instance of this class.
     */
    constructor(private client?: AxiosInstance, private saveFile: { hosts: [ { token?: string, name: string }? ] } = { hosts: []}, private paths: any = {}, private hostname: string = "") 
    {
        super("Client", "Core module to using this application.");
    }

    async init(): Promise<void> 
    {
        const
            { logger } = manager,
            verbose = !!flags.verbose;

        this.paths = manager.use("Directory Manager");

        let host = new URL("http://127.0.0.1");

        this.hostname = arguments_.hostname as string;

        try 
        {
            host = new URL(this.hostname.replace("localhost", "127.0.0.1"));
        }
        catch 
        {
            host = new URL("http://" + this.hostname.replace("localhost", "127.0.0.1"));
        }

        if (!host.port) 
        {
            host.port = "810";
            logger.info(sprintf(__("The port didn't specify in hostname, using the default port %s."), chalk.yellowBright(810)), verbose);
        }

        if (host.protocol === "https:") 
        {
            host.protocol = "http:";
            logger.warn(__("The server doesn't support HTTPS protocol, using HTTP protocol instead."), verbose);
        }

        if (host.pathname !== "/") 
        {
            host.pathname = "/";
            logger.warn(__("The hostname doesn't support paths, using the root path."), verbose);
        }

        this.hostname = host.hostname;

        let token: string | undefined;

        if (!fse.existsSync(this.paths.save)) 
        {
            logger.info(sprintf(__("Hosts configuration not found, creating new file with mode %s."), chalk.blueBright("0600")), verbose);
            await fse.writeFile(this.paths.save, zlib.brotliCompressSync(msgpack.pack({ hosts: []}, true)));
            await fse.chmod(this.paths.save, 0o600);
        }

        this.saveFile = msgpack.unpack(zlib.brotliDecompressSync(Buffer.from(await fse.readFile(this.paths.save))));

        if (this.saveFile.hosts && this.saveFile.hosts.some(hostname => hostname && hostname.name === host.hostname)) 
        {
            const found = this.saveFile.hosts.find(hostname => hostname && hostname.name === host.hostname);

            if (found && "token" in found) 
            {
                logger.info(__("Found token in specified host."), verbose);
                token = found.token;
            }
            else if (flags.token && !token) 
            {
                try 
                {
                    logger.info(__("No token found, asking to user."), verbose);

                    token = (await prompt({
                        message: __("Enter token to connect"),
                        name: "token",
                        type: "password"
                    }) as { token: string }).token;
                }
                catch 
                {
                    logger.error("Interrupted the question!");

                    throw new Error("KEYBOARD_INTERRUPT");
                }

                this.saveFile.hosts.push({ name: host.hostname, token });
                logger.info(__("Hostname has been pushed."), verbose);
            }
        }
        else if (flags.token && !token) 
        {
            try 
            {
                logger.info(__("No token found, asking to user."), verbose);

                token = (await prompt({
                    message: __("Enter token to connect"),
                    name: "token",
                    type: "password"
                }) as { token: string }).token;
            }
            catch 
            {
                logger.error("Interrupted the question!");

                throw new Error("KEYBOARD_INTERRUPT");
            }

            this.saveFile.hosts.push({ name: host.hostname, token });
            logger.info(__("Hostname has been pushed."), verbose);
        }

        Timer.time();

        const raw = !!flags["no-compress"];

        this.client = axios.create({
            baseURL: host.toString(),
            headers: token ? {
                "access-control-allow-origin": "*",
                token
            } : { "access-control-allow-origin": "*" },
            params: {
                raw
            }
        });

        logger.info(sprintf(__("Created new client %s. "), chalk.cyan("main")) + Timer.prettyTime(), verbose);

        if (flags.verbose) 
        {
            Timer.time();
            this.client.interceptors.request.use((request) => 
            {
                logger.info(chalk`{greenBright.underline ${__("REQUEST")}} - {yellowBright ${request.method}} ${figures.arrowRight} {blueBright.underline ${request.url}}${request.data
                    ? chalk`\n{white ${raw ? JSON.stringify(request.data) : msgpack.unpack(request.data)}}` : ""}`);

                return request;
            }, (error) => 
            {
                logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}${error.data
                    ? chalk`\n{white ${raw ? JSON.stringify(error.data) : msgpack.unpack(error.data)}}` : ""}`);

                return Promise.reject(error);
            });
            logger.info(__("Request logger created. ") + Timer.prettyTime());
        }

        if (!flags["ignore-test"]) 
        {
            Timer.time();

            logger.info(__("Testing connection using /teapot."), verbose);

            try 
            {
                await this.client.get("/teapot");
            }
            catch (error) 
            {
                if (!error.response) 
                
                    throw new Error(__("Cannot connect to the server."));
                

                switch (error.response.status) 
                {
                    case 403:
                        logger.error(__("Incorrect token."));

                        throw new Error("INCORRECT_TOKEN");

                    case 418:
                        break;

                    default:
                        logger.error(__("Received invalid response."));

                        throw new Error("INVALID_RESPONSE");
                }
            }

            logger.info(__("Connection and authentication tests finished. ") + Timer.prettyTime(), verbose);

            if (flags.verbose) 
            {
                Timer.time();

                this.client.interceptors.response.use((response) => 
                {
                    logger.info(chalk`{greenBright.underline ${__("RESPONSE")}} - {greenBright ${response.status}}: {whiteBright ${response.statusText}}\n{white ${raw ? JSON.stringify(response.data) : msgpack.unpack(response.data)}}`);

                    return response;
                }, (error) => 
                {
                    logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}\n{white ${raw ? JSON.stringify(error.data) : msgpack.unpack(error.data)}}`);

                    return Promise.reject(error);
                });

                logger.info(__("Response logger created. ") + Timer.prettyTime());
            }
        }

        this.enabled = true;
    }

    close(): Promise<void> 
    {
        this.client = undefined;
        this.enabled = false;

        fs.writeFileSync(this.paths.save, zlib.brotliCompressSync(msgpack.pack(this.saveFile, true)));

        return Promise.resolve();
    }

    use(): { instance: AxiosInstance, hostname: string } 
    {
        if (!this.client) 
        
            throw new ModuleNotEnabledError();
        

        return { hostname: this.hostname === "127.0.0.1" ? "localhost" : this.hostname, instance: this.client };
    }
}
