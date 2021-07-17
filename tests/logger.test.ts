import { assert, assertEquals, assertObjectMatch } from "https://deno.land/std@0.101.0/testing/asserts.ts";

import { BaseHandler } from "../src/logger/handlers.ts";
import {
    debug,
    error,
    fatal,
    getLogger,
    hint,
    info,
    Logger,
    LogRecord,
    setup,
    success,
    warning
} from "../src/logger/logger.ts";
import { LogLevels } from "../src/logger/levels.ts";

class TestHandler extends BaseHandler {
    public messages: string[] = [];
    public records: LogRecord[] = [];

    public handle(logRecord: LogRecord): void {
        this.records.push(logRecord);

        super.handle(logRecord);
    }

    public log(str: string): void {
        this.messages.push(str);
    }
}

let logger: Logger | null = null;

try {
    logger = getLogger();
} catch (e) {
    console.error(e);
}

Deno.test("logger is initialized", () => {
    assert(logger instanceof Logger);
});

Deno.test("default loggers work as expected", () => {
    console.log("\n");

    const sym = Symbol("a");
    const debugData: string = debug("foo");
    const debugResolver: string | undefined = debug(() => "foo");
    const hintData: null = hint(null);
    const hintResolver: symbol | undefined = success(() => sym);
    const successData: symbol = success(sym);
    const successResolver: symbol | undefined = success(() => sym);
    const infoData: number = info(456, 1, 2, 3);
    const infoResolver: boolean | undefined = info(() => true);
    const warningData: symbol = warning(sym);
    const warningResolver: null | undefined = warning(() => null);
    const errorData: undefined = error(undefined, 1, 2, 3);
    const errorResolver: bigint | undefined = error(() => 5n);
    const fatalData: string = fatal("foo");
    const fatalResolver: string | undefined = fatal(() => "bar");

    assertEquals(debugData, "foo");
    assertEquals(debugResolver, undefined);
    assertEquals(hintData, null);
    assertEquals(hintResolver, undefined);
    assertEquals(successData, sym);
    assertEquals(successResolver, undefined);
    assertEquals(infoData, 456);
    assertEquals(infoResolver, true);
    assertEquals(warningData, sym);
    assertEquals(warningResolver, null);
    assertEquals(errorData, undefined);
    assertEquals(errorResolver, 5n);
    assertEquals(fatalData, "foo");
    assertEquals(fatalResolver, "bar");
});

Deno.test("logging works as expected with non-exist logger name", () => {
    const testLogger = getLogger("abcde");
    const expected = getLogger();

    assertObjectMatch(testLogger, expected as unknown as Record<PropertyKey, unknown>);
});

Deno.test("loggers have level and levelName to get/set loglevel", async () => {
    const testHandler = new TestHandler("Debug");

    await setup({
        handlers: {
            test: testHandler
        },

        loggers: {
            // configure default logger available via short-hand methods above
            default: {
                level: "Debug",
                handlers: [ "test" ]
            }
        }
    });

    const logger: Logger = getLogger();

    assertEquals(logger.levelName, "Debug");
    assertEquals(logger.level, LogLevels.Debug);

    logger.debug("debug");
    logger.error("error");
    logger.fatal("critical");

    assertEquals(testHandler.messages.length, 3);
    assert(testHandler.messages[0].startsWith("[ DEBUG   ] ( default ) ")
        && testHandler.messages[0].endsWith(" - debug"));
    assert(testHandler.messages[1].startsWith("[ ERROR   ] ( default ) ")
        && testHandler.messages[1].endsWith(" - error"));
    assert(testHandler.messages[2].startsWith("[ FATAL   ] ( default ) ")
        && testHandler.messages[2].endsWith(" - critical"));

    testHandler.messages = [];

    logger.level = LogLevels.Warning;

    assertEquals(logger.levelName, "Warning");
    assertEquals(logger.level, LogLevels.Warning);

    logger.debug("debug2");
    logger.error("error2");
    logger.fatal("critical2");

    assertEquals(testHandler.messages.length, 2);
    assert(testHandler.messages[0].startsWith("[ ERROR   ] ( default ) ")
        && testHandler.messages[0].endsWith(" - error2"));
    assert(testHandler.messages[1].startsWith("[ FATAL   ] ( default ) ")
        && testHandler.messages[1].endsWith(" - critical2"));

    testHandler.messages = [];

    logger.levelName = "Fatal";

    assertEquals(logger.levelName, "Fatal");

    assertEquals(logger.level, LogLevels.Fatal);

    logger.debug("debug3");
    logger.error("error3");
    logger.fatal("critical3");

    assertEquals(testHandler.messages.length, 1);
    assert(testHandler.messages[0].startsWith("[ FATAL   ] ( default ) ")
        && testHandler.messages[0].endsWith(" - critical3"));
});

Deno.test("loggers have loggerName to get logger name", async () => {
    const testHandler = new TestHandler("Debug");

    await setup({
        handlers: {
            test: testHandler
        },
        loggers: {
            namedA: {
                level: "Debug",
                handlers: [ "test" ]
            },
            namedB: {
                level: "Debug",
                handlers: [ "test" ]
            }
        }
    });

    assertEquals(getLogger("namedA").loggerName, "namedA");
    assertEquals(getLogger("namedB").loggerName, "namedB");
    assertEquals(getLogger().loggerName, "default");
    assertEquals(getLogger("nonsetupname").loggerName, "nonsetupname");
});

Deno.test("logger has mutable members", async () => {
    const testHandlerA = new TestHandler("Debug");
    const testHandlerB = new TestHandler("Debug");

    await setup({
        handlers: {
            testA: testHandlerA,
            testB: testHandlerB
        },

        loggers: {
            default: {
                level: "Debug",
                handlers: [ "testA" ]
            }
        }
    });

    const logger: Logger = getLogger();

    logger.info("msg1");
    assertEquals(testHandlerA.messages.length, 1);
    assert(testHandlerA.messages[0].startsWith("[ INFO    ] ( default ) ")
        && testHandlerA.messages[0].endsWith(" - msg1"));
    assertEquals(testHandlerB.messages.length, 0);

    logger.handlers = [ testHandlerA, testHandlerB ];

    logger.info("msg2");
    assertEquals(testHandlerA.messages.length, 2);
    assert(testHandlerA.messages[1].startsWith("[ INFO    ] ( default ) ")
        && testHandlerA.messages[1].endsWith(" - msg2"));
    assertEquals(testHandlerB.messages.length, 1);
    assert(testHandlerB.messages[0].startsWith("[ INFO    ] ( default ) ")
        && testHandlerB.messages[0].endsWith(" - msg2"));

    logger.handlers = [ testHandlerB ];

    logger.info("msg3");
    assertEquals(testHandlerA.messages.length, 2);
    assertEquals(testHandlerB.messages.length, 2);
    assert(testHandlerB.messages[1].startsWith("[ INFO    ] ( default ) ")
        && testHandlerB.messages[1].endsWith(" - msg3"));

    logger.handlers = [];
    logger.info("msg4");
    assertEquals(testHandlerA.messages.length, 2);
    assertEquals(testHandlerB.messages.length, 2);
});

Deno.test("logger works as expected with default use", () => {
    const handler = new TestHandler("Debug");
    let logger = new Logger("default", "Debug");

    assertEquals(logger.level, LogLevels.Debug);
    assertEquals(logger.levelName, "Debug");
    assertEquals(logger.handlers, []);

    logger = new Logger("default", "Debug", { handlers: [ handler ] });

    assertEquals(logger.handlers, [ handler ]);
});

Deno.test("logger works as expected with custom handlers", () => {
    const handler = new TestHandler("Debug");
    const logger = new Logger("default", "Debug", { handlers: [ handler ] });

    const inlineData: string = logger.debug("foo", 1, 2);

    const record = handler.records[0];
    assertEquals(record.msg, "foo");
    assertEquals(record.level, LogLevels.Debug);
    assertEquals(record.levelName, "Debug");

    assert(handler.messages[0].startsWith("[ DEBUG   ] ( default ) ")
        && handler.messages[0].endsWith(" - foo"));
    assertEquals(inlineData!, "foo");
});

Deno.test("String resolver fn will not execute if msg will not be logged", () => {
    const handler = new TestHandler("Error");
    const logger = new Logger("default", "Error", { handlers: [ handler ] });

    let called = false;

    const expensiveFunction = (): string => {
        called = true;

        return "expensive function result";
    };

    const inlineData: string | undefined = logger.debug(
        expensiveFunction,
        1,
        2
    );
    assert(!called);
    assertEquals(inlineData, undefined);
});

Deno.test("String resolver fn resolves as expected", () => {
    const handler = new TestHandler("Error");
    const logger = new Logger("default", "Error", { handlers: [ handler ] });

    const expensiveFunction = (x: number): string => {
        return "expensive function result " + x;
    };

    const firstInlineData = logger.error(() => expensiveFunction(5));
    const secondInlineData = logger.error(() => expensiveFunction(12), 1, "abc");

    assertEquals(firstInlineData, "expensive function result 5");
    assertEquals(secondInlineData, "expensive function result 12");
});
