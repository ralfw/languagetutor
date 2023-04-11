/**
 * A parser that can read a single argument
 * value.
 *
 * Implement this interface to provide parsers
 * for custom argument types.
 */ const ISO_8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
const LOCAL_DATE_FORMATS = [
    /^(?<year>\d{4})-(?<month>\d\d?)-(?<day>\d\d?)(\s+(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?)?$/i,
    /^(?<year>\d{4}).(?<month>\d\d?).(?<day>\d\d?)(\s+(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?)?$/i,
    /^(?<year>\d{4}) (?<month>\d\d?) (?<day>\d\d?)(\s+(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?)?$/i,
    /^(?<year>\d{4})\/(?<month>\d\d?)\/(?<day>\d\d?)(\s+(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?)?$/i,
    /^(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?\s+(?<year>\d{4})-(?<month>\d\d?)-(?<day>\d\d?)$/i,
    /^(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?\s+(?<year>\d{4}).(?<month>\d\d?).(?<day>\d\d?)$/i,
    /^(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?\s+(?<year>\d{4}) (?<month>\d\d?) (?<day>\d\d?)$/i,
    /^(?<hours>\d\d?):(?<minutes>\d\d)(:(?<seconds>\d\d))?\s+(?<year>\d{4})\/(?<month>\d\d)\/(?<day>\d\d)$/i
];
function escapeRawArgument(string) {
    return `'${string.replaceAll("'", "\\'")}'`;
}
/**
 * Returns the provided CLI argument as a `string` without
 * performing any validation.
 */ export const string = Object.freeze({
    parse: (raw)=>raw,
    typeName: "STRING"
});
/**
 * Returns the provided CLI argument as a `number`.
 * `Infinity` and `Nan` are not valid numbers.
 */ export const number = Object.freeze({
    parse: (raw)=>{
        const value = raw.trim().toLowerCase();
        const num = Number(value);
        if (value.length > 0 && !Number.isNaN(num)) {
            return num;
        } else {
            throw new Error(`${escapeRawArgument(raw)} is not a number`);
        }
    },
    typeName: "NUMBER"
});
/**
 * Returns the provided CLI argument as a `number`, if it is an
 * integer.
 */ export const integer = Object.freeze({
    parse: (raw)=>{
        const value = raw.trim();
        if (/^[-+]?\d+$/.test(value)) {
            const number = Number(value);
            if (Object.is(number, -0)) return 0;
            else return number;
        } else {
            throw new Error(`${escapeRawArgument(raw)} is not an integer`);
        }
    },
    typeName: "INTEGER"
});
/**
 * Return the provided CLI argument as a `boolean`. Case-insensitive
 * versions of `yes`/`no`, `true`/`false`, `y`/`n`, `1`/`0` are all
 * accepted.
 */ export const boolean = Object.freeze({
    parse: (raw)=>{
        const truthy = [
            "yes",
            "true",
            "y",
            "1"
        ];
        const falsey = [
            "no",
            "false",
            "n",
            "0"
        ];
        const value = raw.trim().toLowerCase();
        if (truthy.includes(value)) {
            return true;
        } else if (falsey.includes(value)) {
            return false;
        } else {
            throw new Error(`${escapeRawArgument(raw)} is not a boolean`);
        }
    },
    typeName: "BOOLEAN"
});
/**
 * Returns the provided CLI argument as a `Date`. This supports local
 * dates and times, ISO8601 strings, and the special constants `now`
 * (current time) and `today` (start of current day in local time-zone).
 */ export const date = Object.freeze({
    parse: (raw)=>{
        const trimmed = raw.trim().toLowerCase();
        if (trimmed.match(ISO_8601)) {
            return new Date(trimmed);
        } else if (trimmed === "now") {
            return new Date();
        } else if (trimmed === "today") {
            const date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        } else {
            for (const format of LOCAL_DATE_FORMATS){
                const match = trimmed.match(format);
                if (match != null) {
                    const year = parseInt(match.groups.year);
                    const month = parseInt(match.groups.month) - 1;
                    if (month < 0 || 11 < month) continue;
                    const day = parseInt(match.groups.day);
                    if (day < 1 || 31 < day) continue;
                    const hours = parseInt(match.groups.hours ?? "0");
                    if (hours < 0 || 23 < hours) continue;
                    const minutes = parseInt(match.groups.minutes ?? "0");
                    if (minutes < 0 || 59 < minutes) continue;
                    const seconds = parseInt(match.groups.seconds ?? "0");
                    if (seconds < 0 || 59 < seconds) continue;
                    return new Date(year, month, day, hours, minutes, seconds);
                }
            }
            throw new Error(`${escapeRawArgument(raw)} is not a valid date`);
        }
    },
    typeName: "DATE"
});
/**
 * Returns a value from a provided set of options, if the CLI argument
 * matches. Options are matched case-insensitively e.g.
 * `choice("CONFIRM", ["yes", "no"])` matches both `yes` and `Yes`.
 *
 * This always returns exact string provided in `choices`, e.g.
 * `choice("CONFIRM", ["yes", "no"])`, matching on `Yes` would return
 * `yes`.
 */ export function choice(typeName, choices) {
    const choiceMap = choices.reduce((map, choice)=>{
        map.set(choice.toLowerCase(), choice);
        return map;
    }, new Map());
    return Object.freeze({
        parse: (raw)=>{
            const key = raw.trim().toLowerCase();
            if (choiceMap.has(key)) {
                return choiceMap.get(key);
            } else {
                throw new Error(`expected one of ${choices.map(escapeRawArgument).join(", ")} but received ${escapeRawArgument(raw)}`);
            }
        },
        typeName: typeName.toUpperCase()
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2xheUB2MC4yLjUvc3JjL3R5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQSBwYXJzZXIgdGhhdCBjYW4gcmVhZCBhIHNpbmdsZSBhcmd1bWVudFxuICogdmFsdWUuXG4gKlxuICogSW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIHRvIHByb3ZpZGUgcGFyc2Vyc1xuICogZm9yIGN1c3RvbSBhcmd1bWVudCB0eXBlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFR5cGU8VD4ge1xuICAvKipcbiAgICogRnVuY3Rpb24gd2hpY2ggcGFyc2VzIGEgc2luZ2xlIGFyZ3VtZW50LiBJZlxuICAgKiB0aGUgcGFyc2luZyBmYWlscywgdGhpcyBzaG91bGQgdGhyb3cgYW4gZXJyb3IuXG4gICAqL1xuICByZWFkb25seSBwYXJzZTogKHJhdzogc3RyaW5nKSA9PiBUO1xuXG4gIC8qKlxuICAgKiBUeXBlIG5hbWUgdG8gdXNlIHdoZW4gZGlzcGxheWluZyBoZWxwIGFuZFxuICAgKiBlcnJvciBtZXNzYWdlcy5cbiAgICovXG4gIHJlYWRvbmx5IHR5cGVOYW1lOiBzdHJpbmc7XG59XG5cbmNvbnN0IElTT184NjAxID1cbiAgL15cXGR7NH0tXFxkXFxkLVxcZFxcZFRcXGRcXGQ6XFxkXFxkOlxcZFxcZChcXC5cXGQrKT8oKFsrLV1cXGRcXGQ6XFxkXFxkKXxaKT8kL2k7XG5jb25zdCBMT0NBTF9EQVRFX0ZPUk1BVFMgPSBbXG4gIC9eKD88eWVhcj5cXGR7NH0pLSg/PG1vbnRoPlxcZFxcZD8pLSg/PGRheT5cXGRcXGQ/KShcXHMrKD88aG91cnM+XFxkXFxkPyk6KD88bWludXRlcz5cXGRcXGQpKDooPzxzZWNvbmRzPlxcZFxcZCkpPyk/JC9pLFxuICAvXig/PHllYXI+XFxkezR9KS4oPzxtb250aD5cXGRcXGQ/KS4oPzxkYXk+XFxkXFxkPykoXFxzKyg/PGhvdXJzPlxcZFxcZD8pOig/PG1pbnV0ZXM+XFxkXFxkKSg6KD88c2Vjb25kcz5cXGRcXGQpKT8pPyQvaSxcbiAgL14oPzx5ZWFyPlxcZHs0fSkgKD88bW9udGg+XFxkXFxkPykgKD88ZGF5PlxcZFxcZD8pKFxccysoPzxob3Vycz5cXGRcXGQ/KTooPzxtaW51dGVzPlxcZFxcZCkoOig/PHNlY29uZHM+XFxkXFxkKSk/KT8kL2ksXG4gIC9eKD88eWVhcj5cXGR7NH0pXFwvKD88bW9udGg+XFxkXFxkPylcXC8oPzxkYXk+XFxkXFxkPykoXFxzKyg/PGhvdXJzPlxcZFxcZD8pOig/PG1pbnV0ZXM+XFxkXFxkKSg6KD88c2Vjb25kcz5cXGRcXGQpKT8pPyQvaSxcbiAgL14oPzxob3Vycz5cXGRcXGQ/KTooPzxtaW51dGVzPlxcZFxcZCkoOig/PHNlY29uZHM+XFxkXFxkKSk/XFxzKyg/PHllYXI+XFxkezR9KS0oPzxtb250aD5cXGRcXGQ/KS0oPzxkYXk+XFxkXFxkPykkL2ksXG4gIC9eKD88aG91cnM+XFxkXFxkPyk6KD88bWludXRlcz5cXGRcXGQpKDooPzxzZWNvbmRzPlxcZFxcZCkpP1xccysoPzx5ZWFyPlxcZHs0fSkuKD88bW9udGg+XFxkXFxkPykuKD88ZGF5PlxcZFxcZD8pJC9pLFxuICAvXig/PGhvdXJzPlxcZFxcZD8pOig/PG1pbnV0ZXM+XFxkXFxkKSg6KD88c2Vjb25kcz5cXGRcXGQpKT9cXHMrKD88eWVhcj5cXGR7NH0pICg/PG1vbnRoPlxcZFxcZD8pICg/PGRheT5cXGRcXGQ/KSQvaSxcbiAgL14oPzxob3Vycz5cXGRcXGQ/KTooPzxtaW51dGVzPlxcZFxcZCkoOig/PHNlY29uZHM+XFxkXFxkKSk/XFxzKyg/PHllYXI+XFxkezR9KVxcLyg/PG1vbnRoPlxcZFxcZClcXC8oPzxkYXk+XFxkXFxkKSQvaSxcbl07XG5cbmZ1bmN0aW9uIGVzY2FwZVJhd0FyZ3VtZW50KHN0cmluZzogc3RyaW5nKSB7XG4gIHJldHVybiBgJyR7c3RyaW5nLnJlcGxhY2VBbGwoXCInXCIsIFwiXFxcXCdcIil9J2A7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcHJvdmlkZWQgQ0xJIGFyZ3VtZW50IGFzIGEgYHN0cmluZ2Agd2l0aG91dFxuICogcGVyZm9ybWluZyBhbnkgdmFsaWRhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IHN0cmluZzogQXJndW1lbnRUeXBlPHN0cmluZz4gPSBPYmplY3QuZnJlZXplKHtcbiAgcGFyc2U6IChyYXc6IHN0cmluZyk6IHN0cmluZyA9PiByYXcsXG4gIHR5cGVOYW1lOiBcIlNUUklOR1wiLFxufSk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcHJvdmlkZWQgQ0xJIGFyZ3VtZW50IGFzIGEgYG51bWJlcmAuXG4gKiBgSW5maW5pdHlgIGFuZCBgTmFuYCBhcmUgbm90IHZhbGlkIG51bWJlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBudW1iZXI6IEFyZ3VtZW50VHlwZTxudW1iZXI+ID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHBhcnNlOiAocmF3OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gcmF3LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IG51bSA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA+IDAgJiYgIU51bWJlci5pc05hTihudW0pKSB7XG4gICAgICByZXR1cm4gbnVtO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZXNjYXBlUmF3QXJndW1lbnQocmF3KX0gaXMgbm90IGEgbnVtYmVyYCk7XG4gICAgfVxuICB9LFxuICB0eXBlTmFtZTogXCJOVU1CRVJcIixcbn0pO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHByb3ZpZGVkIENMSSBhcmd1bWVudCBhcyBhIGBudW1iZXJgLCBpZiBpdCBpcyBhblxuICogaW50ZWdlci5cbiAqL1xuZXhwb3J0IGNvbnN0IGludGVnZXI6IEFyZ3VtZW50VHlwZTxudW1iZXI+ID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHBhcnNlOiAocmF3OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gcmF3LnRyaW0oKTtcbiAgICBpZiAoL15bLStdP1xcZCskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgY29uc3QgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgIGlmIChPYmplY3QuaXMobnVtYmVyLCAtMCkpIHJldHVybiAwO1xuICAgICAgZWxzZSByZXR1cm4gbnVtYmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZXNjYXBlUmF3QXJndW1lbnQocmF3KX0gaXMgbm90IGFuIGludGVnZXJgKTtcbiAgICB9XG4gIH0sXG4gIHR5cGVOYW1lOiBcIklOVEVHRVJcIixcbn0pO1xuXG4vKipcbiAqIFJldHVybiB0aGUgcHJvdmlkZWQgQ0xJIGFyZ3VtZW50IGFzIGEgYGJvb2xlYW5gLiBDYXNlLWluc2Vuc2l0aXZlXG4gKiB2ZXJzaW9ucyBvZiBgeWVzYC9gbm9gLCBgdHJ1ZWAvYGZhbHNlYCwgYHlgL2BuYCwgYDFgL2AwYCBhcmUgYWxsXG4gKiBhY2NlcHRlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvb2xlYW46IEFyZ3VtZW50VHlwZTxib29sZWFuPiA9IE9iamVjdC5mcmVlemUoe1xuICBwYXJzZTogKHJhdzogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgY29uc3QgdHJ1dGh5ID0gW1wieWVzXCIsIFwidHJ1ZVwiLCBcInlcIiwgXCIxXCJdO1xuICAgIGNvbnN0IGZhbHNleSA9IFtcIm5vXCIsIFwiZmFsc2VcIiwgXCJuXCIsIFwiMFwiXTtcbiAgICBjb25zdCB2YWx1ZSA9IHJhdy50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodHJ1dGh5LmluY2x1ZGVzKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChmYWxzZXkuaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtlc2NhcGVSYXdBcmd1bWVudChyYXcpfSBpcyBub3QgYSBib29sZWFuYCk7XG4gICAgfVxuICB9LFxuICB0eXBlTmFtZTogXCJCT09MRUFOXCIsXG59KTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwcm92aWRlZCBDTEkgYXJndW1lbnQgYXMgYSBgRGF0ZWAuIFRoaXMgc3VwcG9ydHMgbG9jYWxcbiAqIGRhdGVzIGFuZCB0aW1lcywgSVNPODYwMSBzdHJpbmdzLCBhbmQgdGhlIHNwZWNpYWwgY29uc3RhbnRzIGBub3dgXG4gKiAoY3VycmVudCB0aW1lKSBhbmQgYHRvZGF5YCAoc3RhcnQgb2YgY3VycmVudCBkYXkgaW4gbG9jYWwgdGltZS16b25lKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGU6IEFyZ3VtZW50VHlwZTxEYXRlPiA9IE9iamVjdC5mcmVlemUoe1xuICBwYXJzZTogKHJhdzogc3RyaW5nKTogRGF0ZSA9PiB7XG4gICAgY29uc3QgdHJpbW1lZCA9IHJhdy50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodHJpbW1lZC5tYXRjaChJU09fODYwMSkpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh0cmltbWVkKTtcbiAgICB9IGVsc2UgaWYgKHRyaW1tZWQgPT09IFwibm93XCIpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xuICAgIH0gZWxzZSBpZiAodHJpbW1lZCA9PT0gXCJ0b2RheVwiKSB7XG4gICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIGRhdGUuc2V0SG91cnMoMCk7XG4gICAgICBkYXRlLnNldE1pbnV0ZXMoMCk7XG4gICAgICBkYXRlLnNldFNlY29uZHMoMCk7XG4gICAgICBkYXRlLnNldE1pbGxpc2Vjb25kcygwKTtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGZvcm1hdCBvZiBMT0NBTF9EQVRFX0ZPUk1BVFMpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0cmltbWVkLm1hdGNoKGZvcm1hdCk7XG4gICAgICAgIGlmIChtYXRjaCAhPSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KG1hdGNoLmdyb3VwcyEueWVhcik7XG4gICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChtYXRjaC5ncm91cHMhLm1vbnRoKSAtIDE7XG4gICAgICAgICAgaWYgKG1vbnRoIDwgMCB8fCAxMSA8IG1vbnRoKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBkYXkgPSBwYXJzZUludChtYXRjaC5ncm91cHMhLmRheSk7XG4gICAgICAgICAgaWYgKGRheSA8IDEgfHwgMzEgPCBkYXkpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IGhvdXJzID0gcGFyc2VJbnQobWF0Y2guZ3JvdXBzIS5ob3VycyA/PyBcIjBcIik7XG4gICAgICAgICAgaWYgKGhvdXJzIDwgMCB8fCAyMyA8IGhvdXJzKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBtaW51dGVzID0gcGFyc2VJbnQobWF0Y2guZ3JvdXBzIS5taW51dGVzID8/IFwiMFwiKTtcbiAgICAgICAgICBpZiAobWludXRlcyA8IDAgfHwgNTkgPCBtaW51dGVzKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCBzZWNvbmRzID0gcGFyc2VJbnQobWF0Y2guZ3JvdXBzIS5zZWNvbmRzID8/IFwiMFwiKTtcbiAgICAgICAgICBpZiAoc2Vjb25kcyA8IDAgfHwgNTkgPCBzZWNvbmRzKSBjb250aW51ZTtcbiAgICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRheSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZXNjYXBlUmF3QXJndW1lbnQocmF3KX0gaXMgbm90IGEgdmFsaWQgZGF0ZWApO1xuICAgIH1cbiAgfSxcbiAgdHlwZU5hbWU6IFwiREFURVwiLFxufSk7XG5cbi8qKlxuICogUmV0dXJucyBhIHZhbHVlIGZyb20gYSBwcm92aWRlZCBzZXQgb2Ygb3B0aW9ucywgaWYgdGhlIENMSSBhcmd1bWVudFxuICogbWF0Y2hlcy4gT3B0aW9ucyBhcmUgbWF0Y2hlZCBjYXNlLWluc2Vuc2l0aXZlbHkgZS5nLlxuICogYGNob2ljZShcIkNPTkZJUk1cIiwgW1wieWVzXCIsIFwibm9cIl0pYCBtYXRjaGVzIGJvdGggYHllc2AgYW5kIGBZZXNgLlxuICpcbiAqIFRoaXMgYWx3YXlzIHJldHVybnMgZXhhY3Qgc3RyaW5nIHByb3ZpZGVkIGluIGBjaG9pY2VzYCwgZS5nLlxuICogYGNob2ljZShcIkNPTkZJUk1cIiwgW1wieWVzXCIsIFwibm9cIl0pYCwgbWF0Y2hpbmcgb24gYFllc2Agd291bGQgcmV0dXJuXG4gKiBgeWVzYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNob2ljZTxDIGV4dGVuZHMgc3RyaW5nW10+KFxuICB0eXBlTmFtZTogc3RyaW5nLFxuICBjaG9pY2VzOiBDLFxuKTogQXJndW1lbnRUeXBlPENbbnVtYmVyXT4ge1xuICBjb25zdCBjaG9pY2VNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBjaG9pY2VzLnJlZHVjZSgobWFwLCBjaG9pY2UpID0+IHtcbiAgICBtYXAuc2V0KGNob2ljZS50b0xvd2VyQ2FzZSgpLCBjaG9pY2UpO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIG5ldyBNYXAoKSk7XG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBwYXJzZTogKHJhdykgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gcmF3LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGNob2ljZU1hcC5oYXMoa2V5KSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlTWFwLmdldChrZXkpITtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgZXhwZWN0ZWQgb25lIG9mICR7XG4gICAgICAgICAgICBjaG9pY2VzLm1hcChlc2NhcGVSYXdBcmd1bWVudCkuam9pbihcIiwgXCIpXG4gICAgICAgICAgfSBidXQgcmVjZWl2ZWQgJHtlc2NhcGVSYXdBcmd1bWVudChyYXcpfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0eXBlTmFtZTogdHlwZU5hbWUudG9VcHBlckNhc2UoKSxcbiAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztDQU1DLEdBQ0QsQUFjQSxNQUFNLFdBQ0o7QUFDRixNQUFNLHFCQUFxQjtJQUN6QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0Q7QUFFRCxTQUFTLGtCQUFrQixNQUFjLEVBQUU7SUFDekMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQzdDO0FBRUE7OztDQUdDLEdBQ0QsT0FBTyxNQUFNLFNBQStCLE9BQU8sTUFBTSxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxNQUF3QjtJQUNoQyxVQUFVO0FBQ1osR0FBRztBQUVIOzs7Q0FHQyxHQUNELE9BQU8sTUFBTSxTQUErQixPQUFPLE1BQU0sQ0FBQztJQUN4RCxPQUFPLENBQUMsTUFBd0I7UUFDOUIsTUFBTSxRQUFRLElBQUksSUFBSSxHQUFHLFdBQVc7UUFDcEMsTUFBTSxNQUFNLE9BQU87UUFDbkIsSUFBSSxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxLQUFLLENBQUMsTUFBTTtZQUMxQyxPQUFPO1FBQ1QsT0FBTztZQUNMLE1BQU0sSUFBSSxNQUFNLENBQUMsRUFBRSxrQkFBa0IsS0FBSyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQy9ELENBQUM7SUFDSDtJQUNBLFVBQVU7QUFDWixHQUFHO0FBRUg7OztDQUdDLEdBQ0QsT0FBTyxNQUFNLFVBQWdDLE9BQU8sTUFBTSxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxNQUF3QjtRQUM5QixNQUFNLFFBQVEsSUFBSSxJQUFJO1FBQ3RCLElBQUksYUFBYSxJQUFJLENBQUMsUUFBUTtZQUM1QixNQUFNLFNBQVMsT0FBTztZQUN0QixJQUFJLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU87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