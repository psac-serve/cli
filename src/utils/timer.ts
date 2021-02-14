import chalk from "chalk";

/**
 * Timer counter start numbers.
 */
let hrstart: [ number, number ] | undefined;

/**
 * Nano-units timer utility class.
 */
class Timer {
    /**
     * Start timer.
     */
    public static time(): void {
        hrstart = process.hrtime();
    }

    /**
     * End timer.
     *
     * @returns End timer number. This will use from {@link prettyTime}.
     */
    public static timeEnd(): [ number, number ] {
        const hrend = process.hrtime(hrstart);

        hrstart = undefined;

        return hrend;
    }

    /**
     * Pretty output of the timer.
     * **If you call this function, {@link timeEnd} is not needed.**
     */
    public static prettyTime(): string {
        const hrend = this.timeEnd();

        return chalk`{magentaBright ${hrend[0]}}{whiteBright s} {magentaBright ${hrend[1] / 1000000}}{whiteBright ms}`;
    }
}

export default Timer;

