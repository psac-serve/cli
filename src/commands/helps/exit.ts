import { CommandHelp } from "../../modules/help";

export const help: CommandHelp = {
    description: "Exit the session.",
    parameters: {
        code: {
            description: "Exit code.",
            required: false,
            type: "number"
        }
    }
};
