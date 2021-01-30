import figures from "figures";
import chalk from "chalk";
import prettyError from "pretty-error";
import i18n, { __ } from "i18n";
import ora from "ora";
import { sprintf } from "sprintf-js";
import sudoBlock from "sudo-block";

import { Command as OclifCommand, flags } from "@oclif/command";

import cliCursor from "cli-cursor";

import Timer from "./utils/timer";
import { default as manager, ModuleManagerInstance } from "./manager-instance";

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
    indent: "    ",
    defaultLocale: "en" // Intl.DateTimeFormat().resolvedOptions().locale === "ja-JP" ? "ja" : "en"
});

class BanClient extends OclifCommand {
    static description = __("A client application of the server to manage Minecraft's ban / kick records.")

    static flags: flags.Input<{ [key: string]: unknown }> = {
        version: flags.version({ char: "V", description: __("Show app version.") }),
        verbose: flags["boolean"]({ char: "v", description: __("Enable verbose output.") }),
        help: flags.help({ char: "h", description: __("Show this usage guide.") }),
        token: flags["boolean"]({ char: "t", description: __("Use a token to connect.") }),
        "ignore-test": flags["boolean"]({ char: "i", description: __("Ignore connection testing.") })
    }

    static args = [{
        name: "hostname",
        description: __("Specify the host to connect. If you not specified the port, the client connects with port 810 (example.com:810)."),
        required: true
    }]

    async run(): Promise<void> {
        const { args, flags } = this.parse(BanClient);

        let spinner;

        if (flags.verbose) {
            Timer.time();

            spinner = ora(__("Starting module manager...")).start();
        }

        ModuleManagerInstance.register(flags, args);

        if (flags.verbose && spinner) {
            spinner.succeed(__("Started module manager. ") + Timer.prettyTime());
        }

        Timer.time();

        await manager.initAllModules();

        manager.logger.info(__("Modules loaded. ") + Timer.prettyTime(), flags.verbose as boolean);
        console.log();
        manager.logger.info(chalk`{bold ${sprintf(__("Welcome to the client operator of %s. The commands end with semicolon ';'."), chalk.greenBright(manager.use("Client").hostname))}}`);
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
    }
}

export = BanClient;
