'use strict';

const fs = require('fs');
const readline = require('readline');

/**
 * Splits one CSV line, honouring RFC4180 double-quote escaping.
 * Returns null when the line ends inside an open quoted field, so the
 * caller can join it with the next physical line.
 */
function splitCsvLine(line, carry) {
  const source = carry === undefined ? line : `${carry}\n${line}`;
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (inQuotes) return { incomplete: true, carry: source };
  fields.push(current);
  return { incomplete: false, fields };
}

/**
 * Streams a CSV file row by row as plain objects keyed by header name.
 * Memory use stays flat regardless of file size.
 *
 * @param {string} filePath
 * @param {(row: object, index: number) => void} onRow
 */
async function streamCsv(filePath, onRow) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  let carry;
  let index = 0;

  for await (const rawLine of rl) {
    const line = headers === null ? rawLine.replace(/^\uFEFF/, '') : rawLine;
    const result = splitCsvLine(line, carry);
    if (result.incomplete) {
      carry = result.carry;
      continue;
    }
    carry = undefined;

    if (headers === null) {
      headers = result.fields.map((h) => h.trim());
      continue;
    }
    if (result.fields.length === 1 && result.fields[0].trim() === '') continue;

    const row = {};
    headers.forEach((header, i) => {
      row[header] = result.fields[i] === undefined ? '' : result.fields[i];
    });
    onRow(row, index);
    index += 1;
  }

  return { headers: headers || [], rowCount: index };
}

/** Reads only the header row, so the pipeline never guesses column names. */
async function readHeaders(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    rl.close();
    stream.destroy();
    const result = splitCsvLine(line.replace(/^\uFEFF/, ''));
    return result.incomplete ? [] : result.fields.map((h) => h.trim());
  }
  return [];
}

/** Case/spacing-insensitive header lookup. Returns the real header name. */
function findHeader(headers, ...candidates) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const candidate of candidates) {
    const target = norm(candidate);
    const hit = headers.find((h) => norm(h) === target);
    if (hit) return hit;
  }
  return null;
}

module.exports = { streamCsv, readHeaders, findHeader, splitCsvLine };
