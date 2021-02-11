import chalk from "chalk";

let hrstart: [ number, number ] | undefined;

class Timer 
{
    static time(): void 
    {
        hrstart = process.hrtime();
    }

    static timeEnd(): [ number, number ] 
    {
        const hrend = process.hrtime(hrstart);

        hrstart = undefined;

        return hrend;
    }

    static prettyTime(): string 
    {
        const hrend = this.timeEnd();

        return chalk`{magentaBright ${hrend[0]}}{whiteBright s} {magentaBright ${hrend[1] / 1000000}}{whiteBright ms}`;
    }
}

export default Timer;

