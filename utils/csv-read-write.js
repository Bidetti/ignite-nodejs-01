import { parse } from 'csv-parse';
import fs from 'node:fs';

const csvPath = new URL('/uploads/temp.csv', import.meta.url);

const stream = fs.createWriteStream(csvPath);

const csvParser = parse({ delimiter: ',', from_line: 2, skip_empty_lines: true });

async function run() {
    const parser = stream.pipe(csvParser);

    for await (const record of parser) {
        const [title, description] = record;

        await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
    }
}

run();