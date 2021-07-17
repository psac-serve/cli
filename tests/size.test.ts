import { assertEquals } from "https://deno.land/std@0.101.0/testing/asserts.ts";
import { dirname, fromFileUrl } from "https://deno.land/std@0.101.0/path/mod.ts";

import { columns, lines } from "../src/console/size.ts";

const decoder = new TextDecoder();

const run = (dest: string, ...args: string[]) => {
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
            dest,
            ...args
        ],
        cwd: dirname(fromFileUrl(import.meta.url)),
        stdout: "piped"
    });
};

Deno.test("console window size is current window size", () => {
    assertEquals(lines, Deno.consoleSize(Deno.stdout.rid).rows);
    assertEquals(columns, Deno.consoleSize(Deno.stdout.rid).columns);
});

Deno.test("console window size fallbacks successfully", async () => {
    const process = run("./resources/size.ts");

    try {
        const
            output = await process.output(),
            actual = decoder.decode(output).trim();

        assertEquals(actual, "10x50");
    } finally {
        process.close();
    }
});
