import { assert, assertEquals, assertNotEquals } from "https://deno.land/std@0.101.0/testing/asserts.ts";
import { dirname, fromFileUrl } from "https://deno.land/std@0.101.0/path/mod.ts";

import { stripAnsi } from "https://deno.land/x/tty@0.1.2/strip_ansi.ts";

import { main } from "../src/main.ts";

const decoder = new TextDecoder();

const run = (...args: string[]) => {
    return Deno.run({
        cmd: [
            Deno.execPath(),
            "run",
            "--quiet",
            "--no-check",
            "--allow-env",
            "--allow-read",
            "--allow-write",
            "--unstable",
            "../src/main.ts",
            ...args
        ],
        cwd: dirname(fromFileUrl(import.meta.url)),
        stdout: "piped"
    });
};

Deno.test("shows version by --version", async () => {
    const process = run("--version");

    try {
        const
            output = await process.output(),
            actual = decoder.decode(output).trim();

        assert(actual.startsWith("PSAC Client"));
    } finally {
        process.close();
    }

    const process2 = run("--version");

    try {
        const
            output = await process2.output(),
            actual = decoder.decode(output).trim();

        assert(actual.startsWith("PSAC Client"));
    } finally {
        process2.close();
    }
});

Deno.test("shows help by --help", async () => {
    const process = run("--help");

    try {
        const
            output = await process.output(),
            actual = decoder.decode(output).trim();

        assert(actual.endsWith(": https://github.com/psac-serve/cli"));
    } finally {
        process.close();
    }

    const process2 = run("-h");

    try {
        const
            output = await process2.output(),
            actual = decoder.decode(output).trim();

        assert(actual.endsWith(": https://github.com/psac-serve/cli"));
    } finally {
        process2.close();
    }
});

Deno.test("exit with code 1 if stdin is not a TTY", async () => {
    const process = Deno.run({
        cmd: [
            Deno.execPath(),
            "run",
            "--quiet",
            "--no-check",
            "--allow-env",
            "--allow-read",
            "--allow-write",
            "--unstable",
            "../src/main.ts"
        ],
        cwd: dirname(fromFileUrl(import.meta.url)),
        stdin: "null"
    });

    try {
        const status = await process.status();

        assertEquals(status.code, 255);
    } finally {
        process.close();
    }
});

Deno.test("exit with code 1 if --hostname is empty", async () => {
    assertEquals(await main(), 1);
});

Deno.test("exit with code 1 if --hostname is invalid", async () => {
    assertEquals(await main(",comma.dot:colon"), 1);
});

Deno.test("outs warning with --no-use-token", async () => {
    const process = Deno.run({
        cmd: [
            Deno.execPath(),
            "run",
            "--quiet",
            "--no-check",
            "--allow-env",
            "--allow-read",
            "--allow-write",
            "--unstable",
            "../src/main.ts",
            "--no-use-token",
            "http://example.com"
        ],
        cwd: dirname(fromFileUrl(import.meta.url)),
        stderr: "piped"
    });

    try {
        const
            output = await process.stderrOutput(),
            actual = stripAnsi(decoder.decode(output).trim());

        assertNotEquals(actual.indexOf("--use-token"), -1);
    } finally {
        process.close();
    }
});
