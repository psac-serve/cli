import chalk from "chalk";
import commandLineArgs from "command-line-args";
import { sprintf } from "sprintf-js";
import { terminal } from "terminal-kit";
import { __ } from "i18n";

import SubCommandNotFoundError from "../errors/sub-command-not-found";
import BackgroundViolationError from "../errors/background-violation";
import SessionNotFoundError from "../errors/session-not-found";
import InvalidArgumentsError from "../errors/invalid-arguments";

import manager from "../manager-instance";

import CliComponents from "../utils/cli/components";
import parseHostname from "../utils/hostname";

import { Client } from "../modules/native/clients";

import { Command } from "./base";

export default class Session extends Command<string> 
{
    constructor() 
    {
        super(
            "session",
            {
                description: "Manage / Attach the sessions.",
                subcommands: {
                    attach: {
                        description: "Attach the session.",
                        parameters: {
                            "name|uuid": {
                                description: "Name or UUID of the session.",
                                required: true,
                                type: "string"
                            }
                        }
                    },
                    close: {
                        description: "Close the session.",
                        parameters: {
                            "name|uuid": {
                                description: "Name or UUID of the session.",
                                required: true,
                                type: "string"
                            }
                        }
                    },
                    create: {
                        arguments: {
                            background: {
                                alias: "b",
                                defaultValue: false,
                                description: "Do not attach the session when created.",
                                type: "boolean"
                            },
                            "ignore-test": {
                                alias: "i",
                                defaultValue: false,
                                description: "Ignore connection test.",
                                type: "boolean"
                            },
                            name: {
                                alias: "n",
                                description: "Name of the session.",
                                type: "string"
                            },
                            raw: {
                                alias: "r",
                                defaultValue: false,
                                description: "Do not use compressed connection.",
                                type: "boolean"
                            },
                            token: {
                                alias: "t",
                                defaultValue: false,
                                description: "Use token.",
                                type: "boolean"
                            }
                        },
                        description: "Create a new session.",
                        parameters: {
                            host: {
                                description: "The host to connect to the server.",
                                required: false,
                                type: "string"
                            }
                        }
                    },
                    list: {
                        description: "Show created sessions."
                    }
                }
            },
            [ "sessions" ]
        );
    }

    public async execute(options: string): Promise<number> 
    {
        const { logger, sessions } = manager;
        const subCommand = options.trim().split(" ")[0];

        return await {
            "attach": async () => 
            {
                const
                    name = options.trim().split(" ")[1],
                    isID = /\b[\da-f]{8}\b(?:-[\da-f]{4}){3}-\b[\da-f]{12}\b/.test(name),
                    sessionsWithoutAttached = sessions.sessions.filter((session: Client) => sessions.attaching !== session.id);

                if (isID) 
                {
                    if (!sessionsWithoutAttached.map((session: Client) => session.id).includes(name)) 
                    
                        throw new SessionNotFoundError();
                    

                    sessions.attachSession(name);

                    process.stdout.pause();

                    logger.success(sprintf(__("Successfully attached to session %s %s."), chalk.cyanBright(sessionsWithoutAttached.find((session: Client) => name === session.id).name), chalk`{dim (${name})}`));
                }
                else 
                {
                    if (!sessionsWithoutAttached.map((session: Client) => session.name).includes(name)) 
                    
                        throw new SessionNotFoundError();
                    

                    const session = sessionsWithoutAttached.filter((session: Client) => session.name === name).length > 1
                        ? (await terminal.brightWhite("Similar sessions found, which do you attach?")
                            .singleColumnMenu(sessionsWithoutAttached.filter((session: Client) => name === session.name)
                                .map((session: Client) => `${session.id} - ${session.hostname}`)).promise).selectedText.split(" ")[0]
                        : sessionsWithoutAttached.find((session: Client) => name === session.name).id;

                    sessions.attachSession(session);
                    process.stdout.pause();
                    logger.success(sprintf(__("Successfully attached to session %s %s."), chalk.cyanBright(name), chalk`{dim (${session})}`));
                }

                return 0;
            },
            "close": async () => 
            {
                const
                    name = options.trim().split(" ")[1],
                    isID = /\b[\da-f]{8}\b(?:-[\da-f]{4}){3}-\b[\da-f]{12}\b/.test(name),
                    { sessions } = manager;

                if (isID) 
                {
                    await sessions.closeSession(name);

                    logger.success(sprintf(__("Successfully attached to session %s %s."), chalk.cyanBright(sessions.sessions.find((session: Client) => name === session.id).name || ""), chalk`{dim (${name})}`));
                }
                else 
                {
                    const session = sessions.sessions.filter((session: Client) => session.name === name).length > 1
                        ? (await terminal.brightWhite("Similar sessions found, which do you close?")
                            .singleColumnMenu(sessions.sessions.filter((session: Client) => name === session.name)
                                .map((session: Client) => `${session.id} - ${session.hostname}`)).promise).selectedText.split(" ")[0]
                        : (() => 
                        {
                            const found = sessions.sessions.find((session: Client) => session.name === name);

                            if (!found) 
                            
                                throw new SessionNotFoundError();
                            

                            return found.id;
                        })();

                    await sessions.closeSession(session);
                    process.stdout.pause();
                    logger.success(sprintf(__("Successfully closed the session %s %s."), chalk.cyanBright(name), chalk`{dim (${session})}`));
                }

                return 0;
            },
            "create": () => 
            {
                const parsed = commandLineArgs([{
                    alias: "b",
                    defaultValue: false,
                    name: "background",
                    type: Boolean
                }, {
                    alias: "n",
                    name: "name",
                    type: String
                }, {
                    alias: "r",
                    defaultValue: false,
                    name: "raw",
                    type: Boolean
                }, {
                    alias: "i",
                    defaultValue: false,
                    name: "ignore-test",
                    type: Boolean
                }, {
                    alias: "t",
                    defaultValue: false,
                    name: "token",
                    type: Boolean
                }, {
                    alias: "h",
                    defaultOption: true,
                    name: "host",
                    type: String
                }], { argv: options.trim().split(" ").slice(1) }) as {
                    background: boolean,
                    name: string,
                    raw: boolean,
                    "ignore-test": boolean,
                    token: boolean,
                    host: string
                };

                if (!("host" in parsed) || !parsed.host) 
                
                    throw new InvalidArgumentsError();
                

                const sessionName = !("name" in parsed) ? `session${sessions.sessions.filter((session: Client) => /session\d*$/.test(session.name)).length}` : parsed.name;

                (async (parsed) => 
                {
                    if (!parsed) 
                    
                        throw new BackgroundViolationError();
                    

                    await sessions.createSession(sessionName, parseHostname(parsed.host), parsed.token, parsed.raw, parsed["ignore-test"], !parsed.background);
                })(parsed).then((r) => 
                {
                    logger.success(sprintf(__("Successfully created session %s."), chalk.cyanBright(sessionName)));

                    return r;
                })["catch"]((error) => 
                {
                    throw error;
                });

                return Promise.resolve(0);
            },
            "list": () => 
            {
                console.log(CliComponents.heading(__("Sessions")));
                console.log(CliComponents.keyValueContent(sessions.sessions.map((session: Client) => ({ [chalk.blueBright(session.name)]: chalk.dim(session.id + (session.id === sessions.attaching ? __(" (attached)") : "")) })), 0, true));

                return Promise.resolve(0);
            }
        }[!subCommand || subCommand === "list"
            ? "list"
            : (subCommand
                ? subCommand as "create" | "list" | "attach" | "close"
                : (() => 
                {
                    throw new SubCommandNotFoundError();
                })())]();
    }
}
