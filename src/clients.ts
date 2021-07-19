import { join } from "https://x.nest.land/std@0.101.0/path/mod.ts";

import { generate as generateV4 } from "https://x.nest.land/std@0.101.0/uuid/v4.ts";

import { sprintf } from "https://x.nest.land/std@0.101.0/fmt/printf.ts";
import { colors, tty } from "https://x.nest.land/cliffy@0.19.2/ansi/mod.ts";
import { Secret } from "https://x.nest.land/cliffy@0.19.2/prompt/mod.ts";

import { Soxa } from "https://x.nest.land/soxa@0.0.2/src/core/Soxa.ts";

import dataDir from "https://deno.land/x/data_dir@v0.1.0/mod.ts";

import { compress, decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { pack, unpack } from "https://deno.land/x/msgpackr@v1.3.2/index.js";

import { flags } from "./main.ts";
import { t } from "./translate.ts";

import SessionNotFoundError from "./errors/sessions/session-not-found.ts";
import NoSessionsError from "./errors/sessions/no-sessions.ts";
import SessionLengthTooShortError from "./errors/sessions/session-length.ts";

import { getLogger } from "./logger/logger.ts";
import ConnectionError from "./errors/conn/failed.ts";
import InvalidResponseError from "./errors/conn/response.ts";

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
    instance: Soxa,
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
export class Clients {
    /**
     * Attaching client UUID.
     */
    public attaching = "";

    /**
     * @internal
     * @private
     */
    private readonly knownHosts: [ { token?: string, name: string }? ] = [];

    /**
     * Constructor.
     */
    public constructor() {
        this.knownHosts = unpack(decompress(Deno.readFileSync(join(dataDir() || ".", "psac", "hosts"))));
    }

    /**
     * @internal
     * @private
     */
    private _sessions: Client[] = [];

    /**
     * Get created session(s).
     *
     * @returns Created session(s).
     */
    public get sessions(): Client[] {
        return this._sessions;
    }

    /**
     * Get instance(s).
     *
     * @returns Found instance.
     */
    public get instance(): Soxa {
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
     * Create a new session.
     *
     * @param name - The session name.
     * @param hostname - Session hostname to connect.
     * @param hasToken - If `true`, the session connects with a token.
     * @param raw - Use raw connection.
     * @param ignoreTest - Ignore connection testing.
     * @param attach - Attach to the created session.
     */
    public async createSession(
        name: string,
        hostname: string,
        hasToken = true,
        raw = false,
        ignoreTest = false,
        attach = false
    ): Promise<void> {
        const logger = getLogger(name);
        const found = this.knownHosts.find(knownHost => knownHost && knownHost.name === hostname);

        let token: string | undefined;

        if (hasToken) {
            if (this.knownHosts && this.knownHosts.some(knownHost => knownHost && knownHost.name === hostname) && found && "token" in found) {
                logger.info(t("client.token.found"));

                token = found.token;
            } else {
                const sig = Deno.signals.interrupt();

                (async() => {
                    for await (const _ of sig) {
                        tty.cursorLeft.eraseDown.cursorShow();

                        sig.dispose();

                        logger.error(t("errors.interrupt"));

                        token = "";
                    }
                })().then(r => r);

                token = await Secret.prompt({ message: t("client.token.ask"), cbreak: true, maxLength: 75 });

                sig.dispose();
            }
        }

        const client = new Soxa({
            baseURL: "http://" + hostname,
            transformRequest: [
                (data?: string | Record<string, unknown>) => {
                    if (raw) {
                        return data;
                    } else if (data) {
                        return pack(data).arrayBuffer();
                    }
                }
            ],
            transformResponse: [
                (data?: string | ArrayBuffer) => {
                    if (raw || typeof data === "string") {
                        return data || "";
                    } else if (data) {
                        try {
                            return unpack(new Uint8Array(data)).arrayBuffer();
                        } catch (error) {
                            if (error.message === "Unexpected end of MessagePack data") {
                                return data;
                            }

                            throw error;
                        }
                    }
                }
            ],
            headers: token ? {
                "access-control-allow-origin": "*",
                token
            } : { "access-control-allow-origin": "*" },
            params: {
                raw
            },
            responseType: raw ? "json" : "arraybuffer",
        });

        logger.info(sprintf(t("client.connected"), '"main"'));

        if (flags.verbose) {
            client.interceptors.request.use((config: { baseURL: string, method: string, url: string; data?: string | ArrayBuffer }) => {
                const requestLogger = getLogger("request");
                let data = config.data

                if (!config.data || typeof config.data === "string") {
                    data = data || ""
                } else if (!raw) {
                    data = unpack(new Uint8Array(config.data));
                }

                requestLogger.info(`${colors.magenta(config.method.toUpperCase())} -> ${colors.blue.underline(config.baseURL + config.url)}`, data);

                return config;
            }, (error: { status: string, statusText: string, data?: string | ArrayBuffer }) => {
                let data = error.data

                if (!error.data || typeof error.data === "string") {
                    data = data || ""
                } else if (!raw) {
                    data = unpack(new Uint8Array(error.data));
                }

                logger.error(`${colors.red(error.status)} - ${error.statusText}`, data);

                return Promise.reject(error);
            });

            logger.info(t("client.logger.request"));
        }

        if (!ignoreTest) {
            logger.info(t("client.test.started"));

            try {
                await client.get("/teapot", {
                    validateStatus: (status: number) => status == 418
                });
            } catch (error) {
                console.log(error)
                if (!error.response) {
                    logger.error(t("errors.connection"));

                    throw new ConnectionError(error.message);
                }

                switch (error.response.status) {
                    case 403:
                        logger.error(t("errors.token.incorrect"));

                        throw new Error("INCORRECT_TOKEN");

                    default:
                        logger.error(t("errors.response.invalid"));

                        throw new InvalidResponseError(error.message);
                }
            }
        }

        this.knownHosts.push({ name: hostname, token });
        logger.info(t("client.token.saved"));

        logger.info(t("client.test.finished"));

        if (flags.verbose) {
            client.interceptors.response.use((response: { statusText: string, config: { url: string }, data?: string | ArrayBuffer }) => {
                const requestLogger = getLogger("response");
                let data = response.data

                if (!response.data || typeof response.data === "string") {
                    data = data || ""
                } else if (!raw) {
                    data = unpack(new Uint8Array(response.data));
                }

                requestLogger.info(`${colors.magenta(response.statusText)} <- ${colors.blue.underline(response.config.url)}`, data);

                return response;
            }, (error: { status: string, statusText: string, data?: string | ArrayBuffer }) => {
                let data = error.data

                if (!error.data || typeof error.data === "string") {
                    data = data || ""
                } else if (!raw) {
                    data = unpack(new Uint8Array(error.data));
                }

                logger.error(`${colors.red(error.status)} - ${error.statusText}`, data);

                return Promise.reject(error);
            });

            logger.info(t("client.logger.response"));
        }

        let id = generateV4();

        while (this._sessions.map(session => session.id).includes(id)) {
            id = generateV4();
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
        Deno.writeFileSync(
            join(dataDir() || ".", "psac", "hosts"),
            compress(pack(this.knownHosts)),
            { append: true, create: true }
        );
    }
}
