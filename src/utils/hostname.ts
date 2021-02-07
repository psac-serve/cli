import { sprintf } from "sprintf-js";
import { __ } from "i18n";
import chalk from "chalk";

import { flags, default as manager } from "../manager-instance";

export default (hostname: string): string => {
    const verbose = flags.verbose as boolean;
    const { logger } = manager;

    let host;

    try {
        host = new URL(hostname.replace("localhost", "127.0.0.1"));
    } catch {
        host = new URL("http://" + hostname.replace("localhost", "127.0.0.1"));
    }

    if (!host.port) {
        host.port = "810";
        logger.info(sprintf(__("The port didn't specify in hostname, using the default port %s."), chalk.yellowBright(810)), verbose);
    }

    if (host.protocol === "https:") {
        host.protocol = "http:";
        logger.warn(__("The server doesn't support HTTPS protocol, using HTTP protocol instead."), verbose);
    }

    if (host.pathname !== "/") {
        host.pathname = "/";
        logger.warn(__("The hostname doesn't support paths, using the root path."), verbose);
    }

    return host.hostname;
};
