import figures from "figures";
import chalk from "chalk";
import prettyError from "pretty-error";
import i18n, { __ } from "i18n";
import ora from "ora";
import { sprintf } from "sprintf-js";
import sudoBlock from "sudo-block";

import cliCursor from "cli-cursor";

import ModuleManager from "./modules/manager";
import Arguments from "./modules/arguments";
import Directory from "./modules/directory";
import Logger from "./modules/logger";
import Client from "./modules/client";
import Command from "./modules/command";
import Prompt from "./modules/prompt";
import Help from "./modules/help";

import Timer from "./utils/timer";

sudoBlock(chalk`{redBright ${figures.cross} {underline error} Do not run this app with root permissions.}\n` +
          chalk`        If running without sudo doesn't work, you can either fix your permission\n` +
          chalk`        problems or change where {greenBright npm} stores global packages by putting {magentaBright.underline ~/npm/bin}\n` +
          chalk`        in your {blueBright PATH} and running:\n` +
          chalk`          {dim $} {greenBright npm} {yellowBright config} set {blueBright prefix} {magentaBright.underline ~/npm}`);
prettyError.start();
cliCursor.hide();
i18n.configure({
    locales: [ "en" ],
    directory: `${__dirname}/locales`,
    defaultLocale: "en" //Intl.DateTimeFormat().resolvedOptions().locale === "ja-JP" ? "ja" : "en"
});

const hasVerbose = /(-v|--verbose)/.test(process.argv.join());

let spinner;

if (hasVerbose) {
    Timer.time();

    spinner = ora(chalk.magentaBright(figures.pointer) + " " + __("Resolving modules...")).start();
}

const manager = new ModuleManager([
    new Arguments(),
    new Directory(),
    new Logger(),
    new Client(),
    new Command(),
    new Prompt(),
    new Help()
]);

if (hasVerbose && spinner) {
    spinner.succeed(__("All modules have been resolved successfully. ") + Timer.prettyTime());
}

export default manager;

if (hasVerbose) {
    console.log(chalk.green(figures.tick) + " " + __("Exported Module Manager."));
}

const main = async () => {
    await manager.initAllModules();

    Timer.time();

    const [ , verboseLogger ] = manager.use("Logger");

    verboseLogger.info(__("Modules loaded. ") + Timer.prettyTime());
    console.info(chalk`\n{magentaBright ${figures.pointer}} {bold ${sprintf(__("Welcome to the client operator of %s. The commands end with semicolon ';'."), chalk.greenBright(manager.use("Client").hostname))}}`);
    console.info(chalk`\n{dim.italic ${(() => {
        const items = [
            "ほーん、で？どうしたいの？",
            "一切手をつけないのも、過ぎた最適化を行うのもよろしくない行為である。間を貫き通せ。",
            "時間の無駄になりそうならせめてOSSにしてしまおう。何も起きないよりも一生待ちぼうけしてた方がマシでしょ？",
            "う　ご　い　た　！　リ　リ　ー　ス　だ　！",
            "バグ == 仕様 -> true",
            "バグが治らないのは私が間違っているからではない。言語の仕様が間違っている。",
            "コンピューターを人間らしくしたら、プログラミングはされなくなる。ヲタク達の倫理観が崩れるよ。",
            "ファイアウォールも名前のくせして燃やしたら壊れる。"
        ];

        return items[Math.floor(Math.random() * items.length)];
    })()}}`);
    console.log("\nType \"help [command];\" for help.\n");

    const exitCode = manager.use("Prompt")(0);

    console.log(chalk`{greenBright Good bye.}`);
    await manager.closeAllModules();
    process.exit(exitCode);
};

main().then();
