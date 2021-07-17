export enum LogLevels {
    Debug = 0,
    Hint = 10,
    Success = 20,
    Info = 30,
    Warning = 40,
    Error = 50,
    Fatal = 60
}

export const LogLevelNames = Object.keys(LogLevels).filter((key) =>
    isNaN(Number(key))
);

export type LevelName = keyof typeof LogLevels;

const byLevel: { [p: string]: LevelName } = {
    [String(LogLevels.Debug)]: "Debug",
    [String(LogLevels.Hint)]: "Hint",
    [String(LogLevels.Success)]: "Success",
    [String(LogLevels.Info)]: "Info",
    [String(LogLevels.Warning)]: "Warning",
    [String(LogLevels.Error)]: "Error",
    [String(LogLevels.Fatal)]: "Fatal"
};

export const getLevelByName = (name: LevelName): number => {
    switch (name) {
        case "Debug":
            return LogLevels.Debug;

        case "Hint":
            return LogLevels.Hint;

        case "Success":
            return LogLevels.Success;

        case "Info":
            return LogLevels.Info;

        case "Warning":
            return LogLevels.Warning;

        case "Error":
            return LogLevels.Error;

        case "Fatal":
            return LogLevels.Fatal;

        default:
            throw new Error(`No log level found for "${name}"`);
    }
};

export const getLevelName = (level: number): LevelName => {
    const levelName = byLevel[level];

    if (levelName) {
        return levelName;
    }

    throw new Error(`Uo level name found for level: ${level}`);
};
