import { CommandHelp } from "../../modules/help";

export const help: CommandHelp = {
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
};
