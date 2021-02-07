import { AxiosInstance } from "axios";
import chalk from "chalk";
import { sprintf } from "sprintf-js";
import { __ } from "i18n";

import { default as manager, flags } from "../manager-instance";

import SessionNotFoundError from "../errors/session-not-found";

import Module from "./base";

export interface Session {
    sessionId: number,
    name: string,
    hostname: string,
    token?: string,
    client: AxiosInstance
}

export interface SessionOptions {
    name: string,
    hostname: string,
    token?: string,
    client: AxiosInstance
}

export default class Sessions extends Module {
    constructor(private sessions: Session[] = [], private attaching: Session[] = [], private nowId = 0) {
        super("Sessions Manager", "Manage sessions on-demand.");
    }

    private attach(name: string) {
        const foundSession = this.sessions.map((session: Session) => session.name).indexOf(name);

        if (foundSession === -1) {
            throw new SessionNotFoundError();
        }

        this.attaching[0] = this.sessions[foundSession];
    }

    private create(session: SessionOptions) {
        const { logger } = manager;
        const verbose = flags.verbose as boolean;

        if ("token" in session) {
            logger.info(sprintf(__("Creating authenticated session %s..."), chalk.cyanBright(session.name)), verbose);
        } else {
            logger.info(sprintf(__("Creating session %s..."), chalk.cyanBright(session.name)), verbose);
        }

        if ("token" in session) {
            this.sessions.push({
                client: session.client,
                hostname: session.hostname,
                name: session.name,
                sessionId: this.nowId,
                token: session.token
            });
        } else {
            this.sessions.push({
                client: session.client,
                hostname: session.hostname,
                name: session.name,
                sessionId: this.nowId
            });
        }

        this.nowId++;
    }

    public init(): Promise<void> {
        this.enabled = true;

        return Promise.resolve();
    }

    public use(): { attach: (name: string) => void, create: (session: SessionOptions) => void, nowSession?: Session, sessions: Session[] } {
        return {
            attach: this.attach,
            create: this.create,
            nowSession: this.attaching ? this.attaching[0] : undefined,
            sessions: this.sessions
        };
    }

    public close(): Promise<void> {
        this.enabled = false;

        return Promise.resolve();
    }
}
