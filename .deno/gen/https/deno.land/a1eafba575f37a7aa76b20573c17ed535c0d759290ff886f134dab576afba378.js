// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { bgGreen, bgRed, bold, gray, green, red, white } from "../fmt/colors.ts";
export var DiffType;
(function(DiffType) {
    DiffType["removed"] = "removed";
    DiffType["common"] = "common";
    DiffType["added"] = "added";
})(DiffType || (DiffType = {}));
const REMOVED = 1;
const COMMON = 2;
const ADDED = 3;
function createCommon(A, B, reverse) {
    const common = [];
    if (A.length === 0 || B.length === 0) return [];
    for(let i = 0; i < Math.min(A.length, B.length); i += 1){
        if (A[reverse ? A.length - i - 1 : i] === B[reverse ? B.length - i - 1 : i]) {
            common.push(A[reverse ? A.length - i - 1 : i]);
        } else {
            return common;
        }
    }
    return common;
}
/**
 * Renders the differences between the actual and expected values
 * @param A Actual value
 * @param B Expected value
 */ export function diff(A, B) {
    const prefixCommon = createCommon(A, B);
    const suffixCommon = createCommon(A.slice(prefixCommon.length), B.slice(prefixCommon.length), true).reverse();
    A = suffixCommon.length ? A.slice(prefixCommon.length, -suffixCommon.length) : A.slice(prefixCommon.length);
    B = suffixCommon.length ? B.slice(prefixCommon.length, -suffixCommon.length) : B.slice(prefixCommon.length);
    const swapped = B.length > A.length;
    [A, B] = swapped ? [
        B,
        A
    ] : [
        A,
        B
    ];
    const M = A.length;
    const N = B.length;
    if (!M && !N && !suffixCommon.length && !prefixCommon.length) return [];
    if (!N) {
        return [
            ...prefixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                })),
            ...A.map((a)=>({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: a
                })),
            ...suffixCommon.map((c)=>({
                    type: DiffType.common,
                    value: c
                }))
        ];
    }
    const offset = N;
    const delta = M - N;
    const size = M + N + 1;
    const fp = Array.from({
        length: size
    }, ()=>({
            y: -1,
            id: -1
        }));
    /**
   * INFO:
   * This buffer is used to save memory and improve performance.
   * The first half is used to save route and last half is used to save diff
   * type.
   * This is because, when I kept new uint8array area to save type,performance
   * worsened.
   */ const routes = new Uint32Array((M * N + size + 1) * 2);
    const diffTypesPtrOffset = routes.length / 2;
    let ptr = 0;
    let p = -1;
    function backTrace(A, B, current, swapped) {
        const M = A.length;
        const N = B.length;
        const result = [];
        let a = M - 1;
        let b = N - 1;
        let j = routes[current.id];
        let type = routes[current.id + diffTypesPtrOffset];
        while(true){
            if (!j && !type) break;
            const prev = j;
            if (type === REMOVED) {
                result.unshift({
                    type: swapped ? DiffType.removed : DiffType.added,
                    value: B[b]
                });
                b -= 1;
            } else if (type === ADDED) {
                result.unshift({
                    type: swapped ? DiffType.added : DiffType.removed,
                    value: A[a]
                });
                a -= 1;
            } else {
                result.unshift({
                    type: DiffType.common,
                    value: A[a]
                });
                a -= 1;
                b -= 1;
            }
            j = routes[prev];
            type = routes[prev + diffTypesPtrOffset];
        }
        return result;
    }
    function createFP(slide, down, k, M) {
        if (slide && slide.y === -1 && down && down.y === -1) {
            return {
                y: 0,
                id: 0
            };
        }
        if (down && down.y === -1 || k === M || (slide && slide.y) > (down && down.y) + 1) {
            const prev = slide.id;
            ptr++;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = ADDED;
            return {
                y: slide.y,
                id: ptr
            };
        } else {
            const prev1 = down.id;
            ptr++;
            routes[ptr] = prev1;
            routes[ptr + diffTypesPtrOffset] = REMOVED;
            return {
                y: down.y + 1,
                id: ptr
            };
        }
    }
    function snake(k, slide, down, _offset, A, B) {
        const M = A.length;
        const N = B.length;
        if (k < -N || M < k) return {
            y: -1,
            id: -1
        };
        const fp = createFP(slide, down, k, M);
        while(fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]){
            const prev = fp.id;
            ptr++;
            fp.id = ptr;
            fp.y += 1;
            routes[ptr] = prev;
            routes[ptr + diffTypesPtrOffset] = COMMON;
        }
        return fp;
    }
    while(fp[delta + offset].y < N){
        p = p + 1;
        for(let k = -p; k < delta; ++k){
            fp[k + offset] = snake(k, fp[k - 1 + offset], fp[k + 1 + offset], offset, A, B);
        }
        for(let k1 = delta + p; k1 > delta; --k1){
            fp[k1 + offset] = snake(k1, fp[k1 - 1 + offset], fp[k1 + 1 + offset], offset, A, B);
        }
        fp[delta + offset] = snake(delta, fp[delta - 1 + offset], fp[delta + 1 + offset], offset, A, B);
    }
    return [
        ...prefixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            })),
        ...backTrace(A, B, fp[delta + offset], swapped),
        ...suffixCommon.map((c)=>({
                type: DiffType.common,
                value: c
            }))
    ];
}
/**
 * Renders the differences between the actual and expected strings
 * Partially inspired from https://github.com/kpdecker/jsdiff
 * @param A Actual string
 * @param B Expected string
 */ export function diffstr(A, B) {
    function unescape(string) {
        // unescape invisible characters.
        // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#escape_sequences
        return string.replaceAll("\b", "\\b").replaceAll("\f", "\\f").replaceAll("\t", "\\t").replaceAll("\v", "\\v").replaceAll(/\r\n|\r|\n/g, (str)=>str === "\r" ? "\\r" : str === "\n" ? "\\n\n" : "\\r\\n\r\n");
    }
    function tokenize(string, { wordDiff =false  } = {}) {
        if (wordDiff) {
            // Split string on whitespace symbols
            const tokens = string.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);
            // Extended Latin character set
            const words = /^[a-zA-Z\u{C0}-\u{FF}\u{D8}-\u{F6}\u{F8}-\u{2C6}\u{2C8}-\u{2D7}\u{2DE}-\u{2FF}\u{1E00}-\u{1EFF}]+$/u;
            // Join boundary splits that we do not consider to be boundaries and merge empty strings surrounded by word chars
            for(let i = 0; i < tokens.length - 1; i++){
                if (!tokens[i + 1] && tokens[i + 2] && words.test(tokens[i]) && words.test(tokens[i + 2])) {
                    tokens[i] += tokens[i + 2];
                    tokens.splice(i + 1, 2);
                    i--;
                }
            }
            return tokens.filter((token)=>token);
        } else {
            // Split string on new lines symbols
            const tokens1 = [], lines = string.split(/(\n|\r\n)/);
            // Ignore final empty token when text ends with a newline
            if (!lines[lines.length - 1]) {
                lines.pop();
            }
            // Merge the content and line separators into single tokens
            for(let i1 = 0; i1 < lines.length; i1++){
                if (i1 % 2) {
                    tokens1[tokens1.length - 1] += lines[i1];
                } else {
                    tokens1.push(lines[i1]);
                }
            }
            return tokens1;
        }
    }
    // Create details by filtering relevant word-diff for current line
    // and merge "space-diff" if surrounded by word-diff for cleaner displays
    function createDetails(line, tokens) {
        return tokens.filter(({ type  })=>type === line.type || type === DiffType.common).map((result, i, t)=>{
            if (result.type === DiffType.common && t[i - 1] && t[i - 1]?.type === t[i + 1]?.type && /\s+/.test(result.value)) {
                return {
                    ...result,
                    type: t[i - 1].type
                };
            }
            return result;
        });
    }
    // Compute multi-line diff
    const diffResult = diff(tokenize(`${unescape(A)}\n`), tokenize(`${unescape(B)}\n`));
    const added = [], removed = [];
    for (const result of diffResult){
        if (result.type === DiffType.added) {
            added.push(result);
        }
        if (result.type === DiffType.removed) {
            removed.push(result);
        }
    }
    // Compute word-diff
    const aLines = added.length < removed.length ? added : removed;
    const bLines = aLines === removed ? added : removed;
    for (const a of aLines){
        let tokens = [], b;
        // Search another diff line with at least one common token
        while(bLines.length){
            b = bLines.shift();
            tokens = diff(tokenize(a.value, {
                wordDiff: true
            }), tokenize(b?.value ?? "", {
                wordDiff: true
            }));
            if (tokens.some(({ type , value  })=>type === DiffType.common && value.trim().length)) {
                break;
            }
        }
        // Register word-diff details
        a.details = createDetails(a, tokens);
        if (b) {
            b.details = createDetails(b, tokens);
        }
    }
    return diffResult;
}
/**
 * Colors the output of assertion diffs
 * @param diffType Difference type, either added or removed
 */ function createColor(diffType, { background =false  } = {}) {
    // TODO(@littledivy): Remove this when we can detect
    // true color terminals.
    // https://github.com/denoland/deno_std/issues/2575
    background = false;
    switch(diffType){
        case DiffType.added:
            return (s)=>background ? bgGreen(white(s)) : green(bold(s));
        case DiffType.removed:
            return (s)=>background ? bgRed(white(s)) : red(bold(s));
        default:
            return white;
    }
}
/**
 * Prefixes `+` or `-` in diff output
 * @param diffType Difference type, either added or removed
 */ function createSign(diffType) {
    switch(diffType){
        case DiffType.added:
            return "+   ";
        case DiffType.removed:
            return "-   ";
        default:
            return "    ";
    }
}
export function buildMessage(diffResult, { stringDiff =false  } = {}) {
    const messages = [], diffMessages = [];
    messages.push("");
    messages.push("");
    messages.push(`    ${gray(bold("[Diff]"))} ${red(bold("Actual"))} / ${green(bold("Expected"))}`);
    messages.push("");
    messages.push("");
    diffResult.forEach((result)=>{
        const c = createColor(result.type);
        const line = result.details?.map((detail)=>detail.type !== DiffType.common ? createColor(detail.type, {
                background: true
            })(detail.value) : detail.value).join("") ?? result.value;
        diffMessages.push(c(`${createSign(result.type)}${line}`));
    });
    messages.push(...stringDiff ? [
        diffMessages.join("")
    ] : diffMessages);
    messages.push("");
    return messages;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE4Mi4wL3Rlc3RpbmcvX2RpZmYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHtcbiAgYmdHcmVlbixcbiAgYmdSZWQsXG4gIGJvbGQsXG4gIGdyYXksXG4gIGdyZWVuLFxuICByZWQsXG4gIHdoaXRlLFxufSBmcm9tIFwiLi4vZm10L2NvbG9ycy50c1wiO1xuXG5pbnRlcmZhY2UgRmFydGhlc3RQb2ludCB7XG4gIHk6IG51bWJlcjtcbiAgaWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGVudW0gRGlmZlR5cGUge1xuICByZW1vdmVkID0gXCJyZW1vdmVkXCIsXG4gIGNvbW1vbiA9IFwiY29tbW9uXCIsXG4gIGFkZGVkID0gXCJhZGRlZFwiLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpZmZSZXN1bHQ8VD4ge1xuICB0eXBlOiBEaWZmVHlwZTtcbiAgdmFsdWU6IFQ7XG4gIGRldGFpbHM/OiBBcnJheTxEaWZmUmVzdWx0PFQ+Pjtcbn1cblxuY29uc3QgUkVNT1ZFRCA9IDE7XG5jb25zdCBDT01NT04gPSAyO1xuY29uc3QgQURERUQgPSAzO1xuXG5mdW5jdGlvbiBjcmVhdGVDb21tb248VD4oQTogVFtdLCBCOiBUW10sIHJldmVyc2U/OiBib29sZWFuKTogVFtdIHtcbiAgY29uc3QgY29tbW9uID0gW107XG4gIGlmIChBLmxlbmd0aCA9PT0gMCB8fCBCLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKEEubGVuZ3RoLCBCLmxlbmd0aCk7IGkgKz0gMSkge1xuICAgIGlmIChcbiAgICAgIEFbcmV2ZXJzZSA/IEEubGVuZ3RoIC0gaSAtIDEgOiBpXSA9PT0gQltyZXZlcnNlID8gQi5sZW5ndGggLSBpIC0gMSA6IGldXG4gICAgKSB7XG4gICAgICBjb21tb24ucHVzaChBW3JldmVyc2UgPyBBLmxlbmd0aCAtIGkgLSAxIDogaV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29tbW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29tbW9uO1xufVxuXG4vKipcbiAqIFJlbmRlcnMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzXG4gKiBAcGFyYW0gQSBBY3R1YWwgdmFsdWVcbiAqIEBwYXJhbSBCIEV4cGVjdGVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmPFQ+KEE6IFRbXSwgQjogVFtdKTogQXJyYXk8RGlmZlJlc3VsdDxUPj4ge1xuICBjb25zdCBwcmVmaXhDb21tb24gPSBjcmVhdGVDb21tb24oQSwgQik7XG4gIGNvbnN0IHN1ZmZpeENvbW1vbiA9IGNyZWF0ZUNvbW1vbihcbiAgICBBLnNsaWNlKHByZWZpeENvbW1vbi5sZW5ndGgpLFxuICAgIEIuc2xpY2UocHJlZml4Q29tbW9uLmxlbmd0aCksXG4gICAgdHJ1ZSxcbiAgKS5yZXZlcnNlKCk7XG4gIEEgPSBzdWZmaXhDb21tb24ubGVuZ3RoXG4gICAgPyBBLnNsaWNlKHByZWZpeENvbW1vbi5sZW5ndGgsIC1zdWZmaXhDb21tb24ubGVuZ3RoKVxuICAgIDogQS5zbGljZShwcmVmaXhDb21tb24ubGVuZ3RoKTtcbiAgQiA9IHN1ZmZpeENvbW1vbi5sZW5ndGhcbiAgICA/IEIuc2xpY2UocHJlZml4Q29tbW9uLmxlbmd0aCwgLXN1ZmZpeENvbW1vbi5sZW5ndGgpXG4gICAgOiBCLnNsaWNlKHByZWZpeENvbW1vbi5sZW5ndGgpO1xuICBjb25zdCBzd2FwcGVkID0gQi5sZW5ndGggPiBBLmxlbmd0aDtcbiAgW0EsIEJdID0gc3dhcHBlZCA/IFtCLCBBXSA6IFtBLCBCXTtcbiAgY29uc3QgTSA9IEEubGVuZ3RoO1xuICBjb25zdCBOID0gQi5sZW5ndGg7XG4gIGlmICghTSAmJiAhTiAmJiAhc3VmZml4Q29tbW9uLmxlbmd0aCAmJiAhcHJlZml4Q29tbW9uLmxlbmd0aCkgcmV0dXJuIFtdO1xuICBpZiAoIU4pIHtcbiAgICByZXR1cm4gW1xuICAgICAgLi4ucHJlZml4Q29tbW9uLm1hcChcbiAgICAgICAgKGMpOiBEaWZmUmVzdWx0PHR5cGVvZiBjPiA9PiAoeyB0eXBlOiBEaWZmVHlwZS5jb21tb24sIHZhbHVlOiBjIH0pLFxuICAgICAgKSxcbiAgICAgIC4uLkEubWFwKFxuICAgICAgICAoYSk6IERpZmZSZXN1bHQ8dHlwZW9mIGE+ID0+ICh7XG4gICAgICAgICAgdHlwZTogc3dhcHBlZCA/IERpZmZUeXBlLmFkZGVkIDogRGlmZlR5cGUucmVtb3ZlZCxcbiAgICAgICAgICB2YWx1ZTogYSxcbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICAgLi4uc3VmZml4Q29tbW9uLm1hcChcbiAgICAgICAgKGMpOiBEaWZmUmVzdWx0PHR5cGVvZiBjPiA9PiAoeyB0eXBlOiBEaWZmVHlwZS5jb21tb24sIHZhbHVlOiBjIH0pLFxuICAgICAgKSxcbiAgICBdO1xuICB9XG4gIGNvbnN0IG9mZnNldCA9IE47XG4gIGNvbnN0IGRlbHRhID0gTSAtIE47XG4gIGNvbnN0IHNpemUgPSBNICsgTiArIDE7XG4gIGNvbnN0IGZwOiBGYXJ0aGVzdFBvaW50W10gPSBBcnJheS5mcm9tKFxuICAgIHsgbGVuZ3RoOiBzaXplIH0sXG4gICAgKCkgPT4gKHsgeTogLTEsIGlkOiAtMSB9KSxcbiAgKTtcbiAgLyoqXG4gICAqIElORk86XG4gICAqIFRoaXMgYnVmZmVyIGlzIHVzZWQgdG8gc2F2ZSBtZW1vcnkgYW5kIGltcHJvdmUgcGVyZm9ybWFuY2UuXG4gICAqIFRoZSBmaXJzdCBoYWxmIGlzIHVzZWQgdG8gc2F2ZSByb3V0ZSBhbmQgbGFzdCBoYWxmIGlzIHVzZWQgdG8gc2F2ZSBkaWZmXG4gICAqIHR5cGUuXG4gICAqIFRoaXMgaXMgYmVjYXVzZSwgd2hlbiBJIGtlcHQgbmV3IHVpbnQ4YXJyYXkgYXJlYSB0byBzYXZlIHR5cGUscGVyZm9ybWFuY2VcbiAgICogd29yc2VuZWQuXG4gICAqL1xuICBjb25zdCByb3V0ZXMgPSBuZXcgVWludDMyQXJyYXkoKE0gKiBOICsgc2l6ZSArIDEpICogMik7XG4gIGNvbnN0IGRpZmZUeXBlc1B0ck9mZnNldCA9IHJvdXRlcy5sZW5ndGggLyAyO1xuICBsZXQgcHRyID0gMDtcbiAgbGV0IHAgPSAtMTtcblxuICBmdW5jdGlvbiBiYWNrVHJhY2U8VD4oXG4gICAgQTogVFtdLFxuICAgIEI6IFRbXSxcbiAgICBjdXJyZW50OiBGYXJ0aGVzdFBvaW50LFxuICAgIHN3YXBwZWQ6IGJvb2xlYW4sXG4gICk6IEFycmF5PHtcbiAgICB0eXBlOiBEaWZmVHlwZTtcbiAgICB2YWx1ZTogVDtcbiAgfT4ge1xuICAgIGNvbnN0IE0gPSBBLmxlbmd0aDtcbiAgICBjb25zdCBOID0gQi5sZW5ndGg7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgbGV0IGEgPSBNIC0gMTtcbiAgICBsZXQgYiA9IE4gLSAxO1xuICAgIGxldCBqID0gcm91dGVzW2N1cnJlbnQuaWRdO1xuICAgIGxldCB0eXBlID0gcm91dGVzW2N1cnJlbnQuaWQgKyBkaWZmVHlwZXNQdHJPZmZzZXRdO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoIWogJiYgIXR5cGUpIGJyZWFrO1xuICAgICAgY29uc3QgcHJldiA9IGo7XG4gICAgICBpZiAodHlwZSA9PT0gUkVNT1ZFRCkge1xuICAgICAgICByZXN1bHQudW5zaGlmdCh7XG4gICAgICAgICAgdHlwZTogc3dhcHBlZCA/IERpZmZUeXBlLnJlbW92ZWQgOiBEaWZmVHlwZS5hZGRlZCxcbiAgICAgICAgICB2YWx1ZTogQltiXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGIgLT0gMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gQURERUQpIHtcbiAgICAgICAgcmVzdWx0LnVuc2hpZnQoe1xuICAgICAgICAgIHR5cGU6IHN3YXBwZWQgPyBEaWZmVHlwZS5hZGRlZCA6IERpZmZUeXBlLnJlbW92ZWQsXG4gICAgICAgICAgdmFsdWU6IEFbYV0sXG4gICAgICAgIH0pO1xuICAgICAgICBhIC09IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudW5zaGlmdCh7IHR5cGU6IERpZmZUeXBlLmNvbW1vbiwgdmFsdWU6IEFbYV0gfSk7XG4gICAgICAgIGEgLT0gMTtcbiAgICAgICAgYiAtPSAxO1xuICAgICAgfVxuICAgICAgaiA9IHJvdXRlc1twcmV2XTtcbiAgICAgIHR5cGUgPSByb3V0ZXNbcHJldiArIGRpZmZUeXBlc1B0ck9mZnNldF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVGUChcbiAgICBzbGlkZTogRmFydGhlc3RQb2ludCxcbiAgICBkb3duOiBGYXJ0aGVzdFBvaW50LFxuICAgIGs6IG51bWJlcixcbiAgICBNOiBudW1iZXIsXG4gICk6IEZhcnRoZXN0UG9pbnQge1xuICAgIGlmIChzbGlkZSAmJiBzbGlkZS55ID09PSAtMSAmJiBkb3duICYmIGRvd24ueSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiB7IHk6IDAsIGlkOiAwIH07XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChkb3duICYmIGRvd24ueSA9PT0gLTEpIHx8XG4gICAgICBrID09PSBNIHx8XG4gICAgICAoc2xpZGUgJiYgc2xpZGUueSkgPiAoZG93biAmJiBkb3duLnkpICsgMVxuICAgICkge1xuICAgICAgY29uc3QgcHJldiA9IHNsaWRlLmlkO1xuICAgICAgcHRyKys7XG4gICAgICByb3V0ZXNbcHRyXSA9IHByZXY7XG4gICAgICByb3V0ZXNbcHRyICsgZGlmZlR5cGVzUHRyT2Zmc2V0XSA9IEFEREVEO1xuICAgICAgcmV0dXJuIHsgeTogc2xpZGUueSwgaWQ6IHB0ciB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmV2ID0gZG93bi5pZDtcbiAgICAgIHB0cisrO1xuICAgICAgcm91dGVzW3B0cl0gPSBwcmV2O1xuICAgICAgcm91dGVzW3B0ciArIGRpZmZUeXBlc1B0ck9mZnNldF0gPSBSRU1PVkVEO1xuICAgICAgcmV0dXJuIHsgeTogZG93bi55ICsgMSwgaWQ6IHB0ciB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNuYWtlPFQ+KFxuICAgIGs6IG51bWJlcixcbiAgICBzbGlkZTogRmFydGhlc3RQb2ludCxcbiAgICBkb3duOiBGYXJ0aGVzdFBvaW50LFxuICAgIF9vZmZzZXQ6IG51bWJlcixcbiAgICBBOiBUW10sXG4gICAgQjogVFtdLFxuICApOiBGYXJ0aGVzdFBvaW50IHtcbiAgICBjb25zdCBNID0gQS5sZW5ndGg7XG4gICAgY29uc3QgTiA9IEIubGVuZ3RoO1xuICAgIGlmIChrIDwgLU4gfHwgTSA8IGspIHJldHVybiB7IHk6IC0xLCBpZDogLTEgfTtcbiAgICBjb25zdCBmcCA9IGNyZWF0ZUZQKHNsaWRlLCBkb3duLCBrLCBNKTtcbiAgICB3aGlsZSAoZnAueSArIGsgPCBNICYmIGZwLnkgPCBOICYmIEFbZnAueSArIGtdID09PSBCW2ZwLnldKSB7XG4gICAgICBjb25zdCBwcmV2ID0gZnAuaWQ7XG4gICAgICBwdHIrKztcbiAgICAgIGZwLmlkID0gcHRyO1xuICAgICAgZnAueSArPSAxO1xuICAgICAgcm91dGVzW3B0cl0gPSBwcmV2O1xuICAgICAgcm91dGVzW3B0ciArIGRpZmZUeXBlc1B0ck9mZnNldF0gPSBDT01NT047XG4gICAgfVxuICAgIHJldHVybiBmcDtcbiAgfVxuXG4gIHdoaWxlIChmcFtkZWx0YSArIG9mZnNldF0ueSA8IE4pIHtcbiAgICBwID0gcCArIDE7XG4gICAgZm9yIChsZXQgayA9IC1wOyBrIDwgZGVsdGE7ICsraykge1xuICAgICAgZnBbayArIG9mZnNldF0gPSBzbmFrZShcbiAgICAgICAgayxcbiAgICAgICAgZnBbayAtIDEgKyBvZmZzZXRdLFxuICAgICAgICBmcFtrICsgMSArIG9mZnNldF0sXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgQSxcbiAgICAgICAgQixcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAobGV0IGsgPSBkZWx0YSArIHA7IGsgPiBkZWx0YTsgLS1rKSB7XG4gICAgICBmcFtrICsgb2Zmc2V0XSA9IHNuYWtlKFxuICAgICAgICBrLFxuICAgICAgICBmcFtrIC0gMSArIG9mZnNldF0sXG4gICAgICAgIGZwW2sgKyAxICsgb2Zmc2V0XSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBBLFxuICAgICAgICBCLFxuICAgICAgKTtcbiAgICB9XG4gICAgZnBbZGVsdGEgKyBvZmZzZXRdID0gc25ha2UoXG4gICAgICBkZWx0YSxcbiAgICAgIGZwW2RlbHRhIC0gMSArIG9mZnNldF0sXG4gICAgICBmcFtkZWx0YSArIDEgKyBvZmZzZXRdLFxuICAgICAgb2Zmc2V0LFxuICAgICAgQSxcbiAgICAgIEIsXG4gICAgKTtcbiAgfVxuICByZXR1cm4gW1xuICAgIC4uLnByZWZpeENvbW1vbi5tYXAoXG4gICAgICAoYyk6IERpZmZSZXN1bHQ8dHlwZW9mIGM+ID0+ICh7IHR5cGU6IERpZmZUeXBlLmNvbW1vbiwgdmFsdWU6IGMgfSksXG4gICAgKSxcbiAgICAuLi5iYWNrVHJhY2UoQSwgQiwgZnBbZGVsdGEgKyBvZmZzZXRdLCBzd2FwcGVkKSxcbiAgICAuLi5zdWZmaXhDb21tb24ubWFwKFxuICAgICAgKGMpOiBEaWZmUmVzdWx0PHR5cGVvZiBjPiA9PiAoeyB0eXBlOiBEaWZmVHlwZS5jb21tb24sIHZhbHVlOiBjIH0pLFxuICAgICksXG4gIF07XG59XG5cbi8qKlxuICogUmVuZGVycyB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCBzdHJpbmdzXG4gKiBQYXJ0aWFsbHkgaW5zcGlyZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20va3BkZWNrZXIvanNkaWZmXG4gKiBAcGFyYW0gQSBBY3R1YWwgc3RyaW5nXG4gKiBAcGFyYW0gQiBFeHBlY3RlZCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZzdHIoQTogc3RyaW5nLCBCOiBzdHJpbmcpIHtcbiAgZnVuY3Rpb24gdW5lc2NhcGUoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIHVuZXNjYXBlIGludmlzaWJsZSBjaGFyYWN0ZXJzLlxuICAgIC8vIHJlZjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nI2VzY2FwZV9zZXF1ZW5jZXNcbiAgICByZXR1cm4gc3RyaW5nXG4gICAgICAucmVwbGFjZUFsbChcIlxcYlwiLCBcIlxcXFxiXCIpXG4gICAgICAucmVwbGFjZUFsbChcIlxcZlwiLCBcIlxcXFxmXCIpXG4gICAgICAucmVwbGFjZUFsbChcIlxcdFwiLCBcIlxcXFx0XCIpXG4gICAgICAucmVwbGFjZUFsbChcIlxcdlwiLCBcIlxcXFx2XCIpXG4gICAgICAucmVwbGFjZUFsbCggLy8gZG9lcyBub3QgcmVtb3ZlIGxpbmUgYnJlYWtzXG4gICAgICAgIC9cXHJcXG58XFxyfFxcbi9nLFxuICAgICAgICAoc3RyKSA9PiBzdHIgPT09IFwiXFxyXCIgPyBcIlxcXFxyXCIgOiBzdHIgPT09IFwiXFxuXCIgPyBcIlxcXFxuXFxuXCIgOiBcIlxcXFxyXFxcXG5cXHJcXG5cIixcbiAgICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiB0b2tlbml6ZShzdHJpbmc6IHN0cmluZywgeyB3b3JkRGlmZiA9IGZhbHNlIH0gPSB7fSk6IHN0cmluZ1tdIHtcbiAgICBpZiAod29yZERpZmYpIHtcbiAgICAgIC8vIFNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlIHN5bWJvbHNcbiAgICAgIGNvbnN0IHRva2VucyA9IHN0cmluZy5zcGxpdCgvKFteXFxTXFxyXFxuXSt8WygpW1xcXXt9J1wiXFxyXFxuXXxcXGIpLyk7XG4gICAgICAvLyBFeHRlbmRlZCBMYXRpbiBjaGFyYWN0ZXIgc2V0XG4gICAgICBjb25zdCB3b3JkcyA9XG4gICAgICAgIC9eW2EtekEtWlxcdXtDMH0tXFx1e0ZGfVxcdXtEOH0tXFx1e0Y2fVxcdXtGOH0tXFx1ezJDNn1cXHV7MkM4fS1cXHV7MkQ3fVxcdXsyREV9LVxcdXsyRkZ9XFx1ezFFMDB9LVxcdXsxRUZGfV0rJC91O1xuXG4gICAgICAvLyBKb2luIGJvdW5kYXJ5IHNwbGl0cyB0aGF0IHdlIGRvIG5vdCBjb25zaWRlciB0byBiZSBib3VuZGFyaWVzIGFuZCBtZXJnZSBlbXB0eSBzdHJpbmdzIHN1cnJvdW5kZWQgYnkgd29yZCBjaGFyc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdG9rZW5zW2kgKyAxXSAmJiB0b2tlbnNbaSArIDJdICYmIHdvcmRzLnRlc3QodG9rZW5zW2ldKSAmJlxuICAgICAgICAgIHdvcmRzLnRlc3QodG9rZW5zW2kgKyAyXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgdG9rZW5zW2ldICs9IHRva2Vuc1tpICsgMl07XG4gICAgICAgICAgdG9rZW5zLnNwbGljZShpICsgMSwgMik7XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW5zLmZpbHRlcigodG9rZW4pID0+IHRva2VuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3BsaXQgc3RyaW5nIG9uIG5ldyBsaW5lcyBzeW1ib2xzXG4gICAgICBjb25zdCB0b2tlbnMgPSBbXSwgbGluZXMgPSBzdHJpbmcuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuXG4gICAgICAvLyBJZ25vcmUgZmluYWwgZW1wdHkgdG9rZW4gd2hlbiB0ZXh0IGVuZHMgd2l0aCBhIG5ld2xpbmVcbiAgICAgIGlmICghbGluZXNbbGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgbGluZXMucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpICUgMikge1xuICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gKz0gbGluZXNbaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2gobGluZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgfVxuXG4gIC8vIENyZWF0ZSBkZXRhaWxzIGJ5IGZpbHRlcmluZyByZWxldmFudCB3b3JkLWRpZmYgZm9yIGN1cnJlbnQgbGluZVxuICAvLyBhbmQgbWVyZ2UgXCJzcGFjZS1kaWZmXCIgaWYgc3Vycm91bmRlZCBieSB3b3JkLWRpZmYgZm9yIGNsZWFuZXIgZGlzcGxheXNcbiAgZnVuY3Rpb24gY3JlYXRlRGV0YWlscyhcbiAgICBsaW5lOiBEaWZmUmVzdWx0PHN0cmluZz4sXG4gICAgdG9rZW5zOiBBcnJheTxEaWZmUmVzdWx0PHN0cmluZz4+LFxuICApIHtcbiAgICByZXR1cm4gdG9rZW5zLmZpbHRlcigoeyB0eXBlIH0pID0+XG4gICAgICB0eXBlID09PSBsaW5lLnR5cGUgfHwgdHlwZSA9PT0gRGlmZlR5cGUuY29tbW9uXG4gICAgKS5tYXAoKHJlc3VsdCwgaSwgdCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAocmVzdWx0LnR5cGUgPT09IERpZmZUeXBlLmNvbW1vbikgJiYgKHRbaSAtIDFdKSAmJlxuICAgICAgICAodFtpIC0gMV0/LnR5cGUgPT09IHRbaSArIDFdPy50eXBlKSAmJiAvXFxzKy8udGVzdChyZXN1bHQudmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgdHlwZTogdFtpIC0gMV0udHlwZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG4gIH1cblxuICAvLyBDb21wdXRlIG11bHRpLWxpbmUgZGlmZlxuICBjb25zdCBkaWZmUmVzdWx0ID0gZGlmZihcbiAgICB0b2tlbml6ZShgJHt1bmVzY2FwZShBKX1cXG5gKSxcbiAgICB0b2tlbml6ZShgJHt1bmVzY2FwZShCKX1cXG5gKSxcbiAgKTtcblxuICBjb25zdCBhZGRlZCA9IFtdLCByZW1vdmVkID0gW107XG4gIGZvciAoY29uc3QgcmVzdWx0IG9mIGRpZmZSZXN1bHQpIHtcbiAgICBpZiAocmVzdWx0LnR5cGUgPT09IERpZmZUeXBlLmFkZGVkKSB7XG4gICAgICBhZGRlZC5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQudHlwZSA9PT0gRGlmZlR5cGUucmVtb3ZlZCkge1xuICAgICAgcmVtb3ZlZC5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB3b3JkLWRpZmZcbiAgY29uc3QgYUxpbmVzID0gYWRkZWQubGVuZ3RoIDwgcmVtb3ZlZC5sZW5ndGggPyBhZGRlZCA6IHJlbW92ZWQ7XG4gIGNvbnN0IGJMaW5lcyA9IGFMaW5lcyA9PT0gcmVtb3ZlZCA/IGFkZGVkIDogcmVtb3ZlZDtcbiAgZm9yIChjb25zdCBhIG9mIGFMaW5lcykge1xuICAgIGxldCB0b2tlbnMgPSBbXSBhcyBBcnJheTxEaWZmUmVzdWx0PHN0cmluZz4+LFxuICAgICAgYjogdW5kZWZpbmVkIHwgRGlmZlJlc3VsdDxzdHJpbmc+O1xuICAgIC8vIFNlYXJjaCBhbm90aGVyIGRpZmYgbGluZSB3aXRoIGF0IGxlYXN0IG9uZSBjb21tb24gdG9rZW5cbiAgICB3aGlsZSAoYkxpbmVzLmxlbmd0aCkge1xuICAgICAgYiA9IGJMaW5lcy5zaGlmdCgpO1xuICAgICAgdG9rZW5zID0gZGlmZihcbiAgICAgICAgdG9rZW5pemUoYS52YWx1ZSwgeyB3b3JkRGlmZjogdHJ1ZSB9KSxcbiAgICAgICAgdG9rZW5pemUoYj8udmFsdWUgPz8gXCJcIiwgeyB3b3JkRGlmZjogdHJ1ZSB9KSxcbiAgICAgICk7XG4gICAgICBpZiAoXG4gICAgICAgIHRva2Vucy5zb21lKCh7IHR5cGUsIHZhbHVlIH0pID0+XG4gICAgICAgICAgdHlwZSA9PT0gRGlmZlR5cGUuY29tbW9uICYmIHZhbHVlLnRyaW0oKS5sZW5ndGhcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZWdpc3RlciB3b3JkLWRpZmYgZGV0YWlsc1xuICAgIGEuZGV0YWlscyA9IGNyZWF0ZURldGFpbHMoYSwgdG9rZW5zKTtcbiAgICBpZiAoYikge1xuICAgICAgYi5kZXRhaWxzID0gY3JlYXRlRGV0YWlscyhiLCB0b2tlbnMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkaWZmUmVzdWx0O1xufVxuXG4vKipcbiAqIENvbG9ycyB0aGUgb3V0cHV0IG9mIGFzc2VydGlvbiBkaWZmc1xuICogQHBhcmFtIGRpZmZUeXBlIERpZmZlcmVuY2UgdHlwZSwgZWl0aGVyIGFkZGVkIG9yIHJlbW92ZWRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29sb3IoXG4gIGRpZmZUeXBlOiBEaWZmVHlwZSxcbiAgeyBiYWNrZ3JvdW5kID0gZmFsc2UgfSA9IHt9LFxuKTogKHM6IHN0cmluZykgPT4gc3RyaW5nIHtcbiAgLy8gVE9ETyhAbGl0dGxlZGl2eSk6IFJlbW92ZSB0aGlzIHdoZW4gd2UgY2FuIGRldGVjdFxuICAvLyB0cnVlIGNvbG9yIHRlcm1pbmFscy5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy8yNTc1XG4gIGJhY2tncm91bmQgPSBmYWxzZTtcbiAgc3dpdGNoIChkaWZmVHlwZSkge1xuICAgIGNhc2UgRGlmZlR5cGUuYWRkZWQ6XG4gICAgICByZXR1cm4gKHM6IHN0cmluZyk6IHN0cmluZyA9PlxuICAgICAgICBiYWNrZ3JvdW5kID8gYmdHcmVlbih3aGl0ZShzKSkgOiBncmVlbihib2xkKHMpKTtcbiAgICBjYXNlIERpZmZUeXBlLnJlbW92ZWQ6XG4gICAgICByZXR1cm4gKHM6IHN0cmluZyk6IHN0cmluZyA9PiBiYWNrZ3JvdW5kID8gYmdSZWQod2hpdGUocykpIDogcmVkKGJvbGQocykpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gd2hpdGU7XG4gIH1cbn1cblxuLyoqXG4gKiBQcmVmaXhlcyBgK2Agb3IgYC1gIGluIGRpZmYgb3V0cHV0XG4gKiBAcGFyYW0gZGlmZlR5cGUgRGlmZmVyZW5jZSB0eXBlLCBlaXRoZXIgYWRkZWQgb3IgcmVtb3ZlZFxuICovXG5mdW5jdGlvbiBjcmVhdGVTaWduKGRpZmZUeXBlOiBEaWZmVHlwZSk6IHN0cmluZyB7XG4gIHN3aXRjaCAoZGlmZlR5cGUpIHtcbiAgICBjYXNlIERpZmZUeXBlLmFkZGVkOlxuICAgICAgcmV0dXJuIFwiKyAgIFwiO1xuICAgIGNhc2UgRGlmZlR5cGUucmVtb3ZlZDpcbiAgICAgIHJldHVybiBcIi0gICBcIjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiICAgIFwiO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE1lc3NhZ2UoXG4gIGRpZmZSZXN1bHQ6IFJlYWRvbmx5QXJyYXk8RGlmZlJlc3VsdDxzdHJpbmc+PixcbiAgeyBzdHJpbmdEaWZmID0gZmFsc2UgfSA9IHt9LFxuKTogc3RyaW5nW10ge1xuICBjb25zdCBtZXNzYWdlczogc3RyaW5nW10gPSBbXSwgZGlmZk1lc3NhZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICBtZXNzYWdlcy5wdXNoKFwiXCIpO1xuICBtZXNzYWdlcy5wdXNoKFwiXCIpO1xuICBtZXNzYWdlcy5wdXNoKFxuICAgIGAgICAgJHtncmF5KGJvbGQoXCJbRGlmZl1cIikpfSAke3JlZChib2xkKFwiQWN0dWFsXCIpKX0gLyAke1xuICAgICAgZ3JlZW4oYm9sZChcIkV4cGVjdGVkXCIpKVxuICAgIH1gLFxuICApO1xuICBtZXNzYWdlcy5wdXNoKFwiXCIpO1xuICBtZXNzYWdlcy5wdXNoKFwiXCIpO1xuICBkaWZmUmVzdWx0LmZvckVhY2goKHJlc3VsdDogRGlmZlJlc3VsdDxzdHJpbmc+KSA9PiB7XG4gICAgY29uc3QgYyA9IGNyZWF0ZUNvbG9yKHJlc3VsdC50eXBlKTtcbiAgICBjb25zdCBsaW5lID0gcmVzdWx0LmRldGFpbHM/Lm1hcCgoZGV0YWlsKSA9PlxuICAgICAgZGV0YWlsLnR5cGUgIT09IERpZmZUeXBlLmNvbW1vblxuICAgICAgICA/IGNyZWF0ZUNvbG9yKGRldGFpbC50eXBlLCB7IGJhY2tncm91bmQ6IHRydWUgfSkoZGV0YWlsLnZhbHVlKVxuICAgICAgICA6IGRldGFpbC52YWx1ZVxuICAgICkuam9pbihcIlwiKSA/PyByZXN1bHQudmFsdWU7XG4gICAgZGlmZk1lc3NhZ2VzLnB1c2goYyhgJHtjcmVhdGVTaWduKHJlc3VsdC50eXBlKX0ke2xpbmV9YCkpO1xuICB9KTtcbiAgbWVzc2FnZXMucHVzaCguLi4oc3RyaW5nRGlmZiA/IFtkaWZmTWVzc2FnZXMuam9pbihcIlwiKV0gOiBkaWZmTWVzc2FnZXMpKTtcbiAgbWVzc2FnZXMucHVzaChcIlwiKTtcblxuICByZXR1cm4gbWVzc2FnZXM7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLE9BQU8sRUFDUCxLQUFLLEVBQ0wsSUFBSSxFQUNKLElBQUksRUFDSixLQUFLLEVBQ0wsR0FBRyxFQUNILEtBQUssUUFDQSxtQkFBbUI7V0FPbkI7VUFBSyxRQUFRO0lBQVIsU0FDVixhQUFBO0lBRFUsU0FFVixZQUFBO0lBRlUsU0FHVixXQUFBO0dBSFUsYUFBQTtBQVlaLE1BQU0sVUFBVTtBQUNoQixNQUFNLFNBQVM7QUFDZixNQUFNLFFBQVE7QUFFZCxTQUFTLGFBQWdCLENBQU0sRUFBRSxDQUFNLEVBQUUsT0FBaUIsRUFBTztJQUMvRCxNQUFNLFNBQVMsRUFBRTtJQUNqQixJQUFJLEVBQUUsTUFBTSxLQUFLLEtBQUssRUFBRSxNQUFNLEtB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