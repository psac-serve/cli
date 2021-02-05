import { terminal } from "terminal-kit";

let [ columns, rows ] = [ process.stdout.columns, process.stdout.rows ];

terminal.on("resize", (width: number, height: number) => {
    [ columns, rows ] = [ width, height ];
});

export { columns, rows };
