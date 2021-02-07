import fs from "fs";
import path from "path";
import zlib from "zlib";
import axios, { AxiosInstance } from "axios";
import chalk from "chalk";
import figures from "figures";
import msgpack from "msgpack";
import { prompt } from "enquirer";
import { sprintf } from "sprintf-js";
import { v4 } from "uuid";
import { __ } from "i18n";

import Timer from "../../utils/timer";

import { default as manager, flags } from "../../manager-instance";

import SessionNotFoundError from "../../errors/session-not-found";
import NoSessionsError from "../../errors/no-sessions";

export interface Client {
    id: string,
    instance: AxiosInstance,
    name: string,
    hostname: string
}

export default class Clients {
    public attaching = "";

    private readonly knownHosts: [ { token?: string, name: string }? ] = []
    private _sessions: Client[] = []

    constructor() {
        this.knownHosts = msgpack.unpack(zlib.brotliDecompressSync(Buffer.from(fs.readFileSync(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts")))));
    }

    get instance(): AxiosInstance {
        if (!this._sessions) {
            throw new NoSessionsError();
        }

        const found = this._sessions.find(client => client.id === this.attaching);

        if (!found) {
            throw new SessionNotFoundError();
        }

        return found.instance;
    }

    get sessions(): Client[] {
        return this._sessions;
    }

    async createSession(name: string, hostname: string, hasToken?: boolean, raw = false, ignoreTest = false, attach = false): Promise<void> {
        const
            { logger } = manager,
            verbose = !!flags.verbose;

        const found = this.knownHosts.find(knownHost => knownHost && knownHost.name === hostname);

        let token: string | undefined;

        if (hasToken) {
            if (this.knownHosts && this.knownHosts.some(knownHost => knownHost && knownHost.name === hostname) && found && "token" in found) {
                logger.info(__("Found token in specified host."), verbose, name);
                token = found.token;
            } else {
                try {
                    logger.info(__("No token found, asking to user."), verbose, name);

                    token = (await prompt({
                        message: __("Enter token to connect"),
                        name: "token",
                        type: "password"
                    }) as { token: string }).token;
                } catch {
                    logger.error("Interrupted the question!", name);

                    throw new Error("KEYBOARD_INTERRUPT");
                }

                this.knownHosts.push({ name: hostname, token });
                logger.info(__("Hostname has been pushed."), verbose, name);
            }
        }

        Timer.time();

        const client = axios.create({
            baseURL: "http://" + hostname,
            headers: token ? {
                "access-control-allow-origin": "*",
                token
            } : { "access-control-allow-origin": "*" },
            params: {
                raw
            }
        });

        logger.info(sprintf(__("Created new client %s. "), chalk.cyan("main")) + Timer.prettyTime(), verbose, name);

        if (flags.verbose) {
            Timer.time();
            client.interceptors.request.use((request) => {
                logger.info(chalk`{greenBright.underline ${__("REQUEST")}} - {yellowBright ${request.method}} ${figures.arrowRight} {blueBright.underline ${request.url}}${request.data
                    ? chalk`\n{white ${raw ? JSON.stringify(request.data) : msgpack.unpack(request.data)}}` : ""}`, true, name);

                return request;
            }, (error) => {
                logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}${error.data
                    ? chalk`\n{white ${raw ? JSON.stringify(error.data) : msgpack.unpack(error.data)}}` : ""}`, true, name);

                return Promise.reject(error);
            });
            logger.info(__("Request logger created. ") + Timer.prettyTime(), true, name);
        }

        if (!ignoreTest) {
            Timer.time();

            logger.info(__("Testing connection using /teapot."), verbose, true, name);

            try {
                await client.get("/teapot");
            } catch (error) {
                if (!error.response) {
                    throw new Error(__("Cannot connect to the server."));
                }

                switch (error.response.status) {
                    case 403:
                        logger.error(__("Incorrect token."), true, name);

                        throw new Error("INCORRECT_TOKEN");

                    case 418:
                        break;

                    default:
                        logger.error(__("Received invalid response."), true, name);

                        throw new Error("INVALID_RESPONSE");
                }
            }

            logger.info(__("Connection and authentication tests finished. ") + Timer.prettyTime(), verbose, name);

            if (flags.verbose) {
                Timer.time();

                client.interceptors.response.use((response) => {
                    logger.info(chalk`{greenBright.underline ${__("RESPONSE")}} - {greenBright ${response.status}}: {whiteBright ${response.statusText}}\n{white ${raw ? JSON.stringify(response.data) : msgpack.unpack(response.data)}}`, true, name);

                    return response;
                }, (error) => {
                    logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}\n{white ${raw ? JSON.stringify(error.data) : msgpack.unpack(error.data)}}`, true, name);

                    return Promise.reject(error);
                });

                logger.info(__("Response logger created. ") + Timer.prettyTime(), true, name);
            }
        }

        const id = v4();

        this._sessions.push({
            hostname,
            id,
            instance: client,
            name
        });

        if (attach) {
            this.attachSession(id);
        }
    }

    attachSession(uuid: string): void {
        if (!this._sessions.some(client => client.id === uuid)) {
            throw new SessionNotFoundError();
        }

        this.attaching = uuid;
    }

    closeAllSession(): void {
        fs.writeFileSync(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts"), zlib.brotliCompressSync(msgpack.pack(this.knownHosts, true)));
    }
}
