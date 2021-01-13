import manager from "..";

export abstract class BaseCommand {
    abstract evaluate(tokens: string): Record<string, unknown>

    abstract execute(commands: string): number
}

export const Command = (commandName: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor): void => manager.use("Command").list = { ...manager.use("Command").list, [commandName]: descriptor.value };
