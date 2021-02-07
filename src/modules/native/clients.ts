import { AxiosInstance } from "axios";
import { v4 } from "uuid";

export interface Client {
    id: string,
    instance: AxiosInstance,
    name: string
}

export default class Clients {
    private _instance: AxiosInstance
    private _sessions: Client[] = []

    constructor() {

    }

    get instance(): AxiosInstance {
        return this._instance;
    }

    get sessions(): Client[] {
        return this._sessions;
    }

    createSession(name: string, hostname: string, raw: boolean = false, ignoreTest: boolean = false): void {

    }

    attachSession(uuid: string): void {

    }
}
