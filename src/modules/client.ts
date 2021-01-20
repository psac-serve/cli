import axios, { AxiosInstance } from "axios";
import chalk from "chalk";
import figures from "figures";
import fse from "fs-extra";
import msgpack from "msgpack";
import { prompt } from "enquirer";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import Timer from "../utils/timer";

import manager from "..";

import Module from "./base";

/**
 * The core module to using this application.
 */
export default class Client extends Module {
    /**
     * Constructor.
     *
     * @param client The axios instance to use interceptors.
     *
     * @returns The instance of this class.
     */
    constructor(private client?: AxiosInstance, private saveFile: {hosts: [{token?: string, name: string}?]} = { hosts: []}) {
        super("Client", "Core module to using this application.");
    }

    async init(): Promise<void> {
        const parsedArguments = manager.use("Arguments Manager");
        const directories = manager.use("Directory Manager");
        const [ logger, verboseLogger ] = manager.use("Logger");

        let host = new URL("http://127.0.0.1");

        try {
            host = new URL(parsedArguments.host);
        } catch {
            host = new URL("http://" + parsedArguments.host);
        }

        if (!host.port) {
            host.port = "810";
            verboseLogger.info(sprintf(__("The port didn't specify in hostname, using the default port %s."), chalk.yellowBright(810)));
        }

        if (host.protocol === "https:") {
            host.protocol = "http:";
            verboseLogger.warning(__("HTTPS protocol doesn't support, using HTTP protocol instead."));
        }

        if (host.pathname !== "/") {
            host.pathname = "/";
            verboseLogger.warning(__("The hostname doesn't support paths, using the root path."));
        }

        let token: string | undefined;

        if (!fse.existsSync(directories.config)) {
            await fse.createFile(directories.config);
            await fse.appendFile(directories.config, msgpack.pack({ hosts: []}, true));
        }

        this.saveFile = msgpack.unpack(await fse.readFile(directories.config));

        const found = this.saveFile.hosts.find(hostname => hostname && hostname.name === host.hostname);

        if (this.saveFile.hosts && found && found.token) {
            token = found.token;
        } else if (parsedArguments.token && !token) {
            try {
                token = (await prompt({
                    type: "password",
                    name: "token",
                    message: __("Enter token to connect")
                }) as {token: string}).token;
            } catch {
                logger.error("Interrupted the question!");

                throw new Error("KEYBOARD_INTERRUPT");
            }

            this.saveFile.hosts.push({ token, name: host.hostname });
        }

        Timer.time();

        this.client = axios.create({
            baseURL: host.toString(),
            headers: token ? {
                token,
                "access-control-allow-origin": "*"
            } : { "access-control-allow-origin": "*" }
        });

        if (parsedArguments.verbose) {
            Timer.time();
            this.client.interceptors.request.use((request) => {
                logger.info(chalk`{greenBright.underline ${__("REQUEST")}} - {yellowBright ${request.method}} ${figures.arrowRight} {blueBright.underline ${request.url}}\n{white ${request.data}}`);

                return request;
            }, (error) => {
                logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}\n{white ${error.data}}`);

                return Promise.reject(error);
            });
            logger.info(__("Request logger created. ") + Timer.prettyTime());
        }

        if (!parsedArguments["ignore-test"]) {
            verboseLogger.info(__("Testing connection using /teapot."));

            try {
                await this.client.get("/teapot");
            } catch (error) {
                if (!error.response.status) {
                    throw new Error(error);
                }

                switch (error.response.status) {
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

            verboseLogger.info(__("Connection and authentication tests finished."));

            if (parsedArguments.verbose) {
                Timer.time();

                this.client.interceptors.response.use((response) => {
                    logger.info(chalk`{greenBright.underline ${__("RESPONSE")}} - {greenBright ${response.status}}: {whiteBright ${response.statusText}}\n{white ${response.data}}`);

                    return response;
                }, (error) => {
                    logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}\n{white ${error.data}}`);

                    return Promise.reject(error);
                });

                logger.info(__("Response logger created. ") + Timer.prettyTime());
            }
        }

        this.enabled = true;
    }

    async close(): Promise<void> {
        this.client = undefined;
        this.enabled = false;

        await fse.writeFile(manager.use("Directory Manager").config, msgpack.pack(this.saveFile, true));
    }

    use(): AxiosInstance {
        if (!this.client) {
            throw new Error("This module not enabled!");
        }

        return this.client;
    }
}
