import { CommandHelp } from "../../modules/help";

export const help: CommandHelp = {
    description: "Manage modules.",
    subcommands: {
        list: {
            description: "Show all loaded modules."
        },
        show: {
            description: "View details for specified module.",
            parameters: {
                module: {
                    description: "Module to display details.",
                    required: true,
                    type: "string"
                }
            }
        }
    }
};
