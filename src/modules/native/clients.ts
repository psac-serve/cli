import { AxiosInstance } from "axios";
import { v4 } from "uuid";

import SessionNotFoundError from "../../errors/session-not-found";
import NoSessionsError from "../../errors/no-sessions";

export interface Client {
    id: string,
    instance: AxiosInstance,
    name: string
}

export default class Clients {
    public attaching = "";

    private _sessions: Client[] = []

    constructor() {

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

    createSession(name: string, hostname: string, raw: boolean = false, ignoreTest: boolean = false): void {

    }

    attachSession(uuid: string): void {
        if (!this._sessions.some(client => client.id === uuid)) {
            throw new SessionNotFoundError();
        }

        this.attaching = uuid;
    }
}
