import { CommandHelp } from "../../modules/help";

export const help: CommandHelp = {
    description: "Show help for a command.",
    parameters: {
        command: {
            description: "The command to show help.",
            required: false,
            type: "string"
        }
    }
};
