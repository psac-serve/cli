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

import manager from "..";

import ModuleNotEnabledError from "../errors/module-not-enabled";

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
     * @param saveFile
     * @param paths
     * @returns The instance of this class.
     */
    constructor(private client?: AxiosInstance, private saveFile: { hosts: [{ token?: string, name: string }?]} = { hosts: []}, private paths: any = {}) {
        super("Client", "Core module to using this application.");
    }

    async init(): Promise<void> {
        const parsedArguments = manager.use("Arguments Manager");
        const [ logger, verboseLogger ] = manager.use("Logger");

        this.paths = manager.use("Directory Manager");

        let host = new URL("http://127.0.0.1");

        try {
            host = new URL(parsedArguments.host.replace("localhost", "127.0.0.1"));
        } catch {
            host = new URL("http://" + parsedArguments.host.replace("localhost", "127.0.0.1"));
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

        if (!fse.existsSync(this.paths.config)) {
            verboseLogger.info(__("Hosts configuration not found, creating new file."));
            await fse.createFile(this.paths.config);
            await fse.appendFile(this.paths.config, zlib.brotliCompressSync(msgpack.pack({ hosts: []}, true)));
        }

        this.saveFile = msgpack.unpack(zlib.brotliDecompressSync(Buffer.from(await fse.readFile(this.paths.config))));

        if (this.saveFile.hosts && this.saveFile.hosts.some(hostname => hostname && hostname.name === host.hostname)) {
            const found = this.saveFile.hosts.find(hostname => hostname && hostname.name === host.hostname);

            if (found && "token" in found) {
                verboseLogger.info(__("Found token in specified host."));
                token = found.token;
            } else if (parsedArguments.token && !token) {
                try {
                    verboseLogger.info(__("No token found, asking the user."));

                    token = (await prompt({
                        type: "password",
                        name: "token",
                        message: __("Enter token to connect")
                    }) as { token: string }).token;
                } catch {
                    logger.error("Interrupted the question!");

                    throw new Error("KEYBOARD_INTERRUPT");
                }

                this.saveFile.hosts.push({ token, name: host.hostname });
            }
        } else if (parsedArguments.token && !token) {
            try {
                verboseLogger.info(__("No token found, asking the user."));

                token = (await prompt({
                    type: "password",
                    name: "token",
                    message: __("Enter token to connect")
                }) as { token: string }).token;
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

        verboseLogger.info(sprintf(__("Created new client %s. "), chalk.cyan("main")) + Timer.prettyTime());

        if (parsedArguments.verbose) {
            Timer.time();
            this.client.interceptors.request.use((request) => {
                logger.info(chalk`{greenBright.underline ${__("REQUEST")}} - {yellowBright ${request.method}} ${figures.arrowRight} {blueBright.underline ${request.url}}${request.data ? chalk`\n{white ${msgpack.unpack(request.data)}}` : ""}`);

                return request;
            }, (error) => {
                logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}${error.data ? chalk`\n{white ${msgpack.unpack(error.data)}}` : ""}`);

                return Promise.reject(error);
            });
            logger.info(__("Request logger created. ") + Timer.prettyTime());
        }

        if (!parsedArguments["ignore-test"]) {
            Timer.time();

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

            verboseLogger.info(__("Connection and authentication tests finished. ") + Timer.prettyTime());

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

    close(): Promise<void> {
        this.client = undefined;
        this.enabled = false;

        fs.writeFileSync(this.paths.config, zlib.brotliCompressSync(msgpack.pack(this.saveFile, true)));

        return Promise.resolve();
    }

    use(): AxiosInstance {
        if (!this.client) {
            throw new ModuleNotEnabledError();
        }

        return this.client;
    }
}
