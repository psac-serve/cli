import fs from "fs";
import path from "path";
import zlib from "zlib";
import axios, { AxiosInstance } from "axios";
import chalk from "chalk";
import figures from "figures";
import msgpack from "msgpack-lite";
import { sprintf } from "sprintf-js";
import { v4 } from "uuid";
import { __ } from "i18n";
import { terminal } from "terminal-kit";

import Timer from "../../utils/timer";

import { default as manager, flags } from "../../manager-instance";

import SessionNotFoundError from "../../errors/session-not-found";
import NoSessionsError from "../../errors/no-sessions";
import SessionLengthTooShortError from "../../errors/session-length-too-short";
import KeyboardInterruptError from "../../errors/keyboard-interrupt";

/**
 * Client session interface.
 */
export interface Client {
    /**
     * The client unique uuid.
     */
    id: string,
    /**
     * The client instance.
     */
    instance: AxiosInstance,
    /**
     * The client name.
     * This is not unique.
     */
    name: string,
    /**
     * The client hostname.
     */
    hostname: string
}

/**
 * Module Manager Native Session Manager.
 * You can use this from {@link ModuleManager}.
 */
export default class Clients {
    /**
     * Attaching client UUID.
     */
    public attaching = "";

    /**
     * @internal
     * @private
     */
    private readonly knownHosts: [ { token?: string, name: string }? ] = []
    /**
     * @internal
     * @private
     */
    private _sessions: Client[] = []

    /**
     * Constructor.
     */
    public constructor() {
        this.knownHosts = msgpack.decode(zlib.brotliDecompressSync(Buffer.from(fs.readFileSync(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts")))));
    }

    /**
     * Get instance(s).
     *
     * @returns Found instance.
     */
    public get instance(): AxiosInstance {
        if (!this._sessions) {
            throw new NoSessionsError();
        }

        const found = this._sessions.find(client => client.id === this.attaching);

        if (!found) {
            throw new SessionNotFoundError();
        }

        return found.instance;
    }

    /**
     * Get created session(s).
     *
     * @returns Created session(s).
     */
    public get sessions(): Client[] {
        return this._sessions;
    }

    /**
     * Create a new session.
     *
     * @param name - The session name.
     * @param hostname - Session hostname to connect.
     * @param hasToken - If `true`, the session connects with a token.
     * @param raw - Use raw connection.
     * @param ignoreTest - Ignore connection testing.
     * @param attach - Attach to the created session.
     */
    public async createSession(name: string, hostname: string, hasToken?: boolean, raw = false, ignoreTest = false, attach = false): Promise<void> {
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

                    token = await terminal(chalk.bold(__("Enter token to connect")) + chalk` {dim >>>} `).inputField({
                        echoChar: true
                    }).promise;
                } catch {
                    throw new KeyboardInterruptError();
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
                    ? chalk`\n{white ${raw ? JSON.stringify(request.data) : msgpack.decode(request.data)}}` : ""}`, true, name);

                return request;
            }, (error) => {
                logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}${error.data
                    ? chalk`\n{white ${raw ? JSON.stringify(error.data) : msgpack.decode(error.data)}}` : ""}`, true, name);

                return Promise.reject(error);
            });
            logger.info(__("Request logger created. ") + Timer.prettyTime(), true, name);
        }

        if (!ignoreTest) {
            Timer.time();

            logger.info(__("Testing connection using /teapot."), verbose, name);

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
                    logger.info(chalk`{greenBright.underline ${__("RESPONSE")}} - {greenBright ${response.status}}: {whiteBright ${response.statusText}}\n{white ${raw ? JSON.stringify(response.data) : msgpack.decode(response.data)}}`, true, name);

                    return response;
                }, (error) => {
                    logger.error(chalk`{redBright.underline ${__("ERROR")}} - {redBright ${error.status}}: {whiteBright ${error.statusText}}\n{white ${raw ? JSON.stringify(error.data) : msgpack.decode(error.data)}}`, true, name);

                    return Promise.reject(error);
                });

                logger.info(__("Response logger created. ") + Timer.prettyTime(), true, name);
            }
        }

        let id = v4();

        while (this._sessions.map(session => session.id).includes(id)) {
            id = v4();
        }

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

    /**
     * Attach to any session.
     *
     * @param uuid - Session UUID.
     */
    public attachSession(uuid: string): void {
        if (!this._sessions.map(session => session.id).includes(uuid)) {
            throw new SessionNotFoundError();
        }

        this.attaching = uuid;
    }

    /**
     * Close specified session.
     *
     * @param uuid - Session UUID.
     */
    closeSession(uuid: string): void {
        const session = this._sessions.map(session => session.id).indexOf(uuid);

        if (session === -1) {
            throw new SessionNotFoundError();
        }

        if (this._sessions.length <= 1) {
            throw new SessionLengthTooShortError();
        }

        if (this.attaching === this._sessions[session].id) {
            this.attachSession(this._sessions.filter(session => session.id !== this.attaching)[Math.floor(Math.random() * this._sessions.length)].id);
        }

        this._sessions = this._sessions.filter(session => session.id !== uuid);
    }

    /**
     * Close all session and save known-hosts.
     */
    closeAllSession(): void {
        fs.writeFileSync(path.join(process.env.UserProfile || process.env.HOME || "/etc", ".ban-cli", "hosts"), zlib.brotliCompressSync(msgpack.encode(this.knownHosts)));
    }
}
