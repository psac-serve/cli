let columns: number, lines: number;

try {
    columns = Deno.consoleSize(Deno.stdout.rid).columns;
} catch {
    columns = 50;
}

try {
    lines = Deno.consoleSize(Deno.stdout.rid).rows;
} catch {
    lines = 10;
}

export {
    columns,
    lines
};
