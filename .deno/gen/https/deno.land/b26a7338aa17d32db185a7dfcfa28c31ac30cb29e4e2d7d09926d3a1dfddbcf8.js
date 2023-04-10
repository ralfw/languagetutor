// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
/** A library of assertion functions.
 * If the assertion is false an `AssertionError` will be thrown which will
 * result in pretty-printed diff of failing assertion.
 *
 * This module is browser compatible, but do not rely on good formatting of
 * values for AssertionError messages in browsers.
 *
 * @module
 */ import { red, stripColor } from "../fmt/colors.ts";
import { buildMessage, diff, diffstr } from "./_diff.ts";
import { format } from "./_format.ts";
const CAN_NOT_DISPLAY = "[Cannot display]";
export class AssertionError extends Error {
    name = "AssertionError";
    constructor(message){
        super(message);
    }
}
function isKeyedCollection(x) {
    return [
        Symbol.iterator,
        "size"
    ].every((k)=>k in x);
}
/**
 * Deep equality comparison used in assertions
 * @param c actual value
 * @param d expected value
 */ export function equal(c, d) {
    const seen = new Map();
    return function compare(a, b) {
        // Have to render RegExp & Date for string comparison
        // unless it's mistreated as object
        if (a && b && (a instanceof RegExp && b instanceof RegExp || a instanceof URL && b instanceof URL)) {
            return String(a) === String(b);
        }
        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            // Check for NaN equality manually since NaN is not
            // equal to itself.
            if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
                return true;
            }
            return aTime === bTime;
        }
        if (typeof a === "number" && typeof b === "number") {
            return Number.isNaN(a) && Number.isNaN(b) || a === b;
        }
        if (Object.is(a, b)) {
            return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
            if (a && b && !constructorsEqual(a, b)) {
                return false;
            }
            if (a instanceof WeakMap || b instanceof WeakMap) {
                if (!(a instanceof WeakMap && b instanceof WeakMap)) return false;
                throw new TypeError("cannot compare WeakMap instances");
            }
            if (a instanceof WeakSet || b instanceof WeakSet) {
                if (!(a instanceof WeakSet && b instanceof WeakSet)) return false;
                throw new TypeError("cannot compare WeakSet instances");
            }
            if (seen.get(a) === b) {
                return true;
            }
            if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
                return false;
            }
            seen.set(a, b);
            if (isKeyedCollection(a) && isKeyedCollection(b)) {
                if (a.size !== b.size) {
                    return false;
                }
                let unmatchedEntries = a.size;
                for (const [aKey, aValue] of a.entries()){
                    for (const [bKey, bValue] of b.entries()){
                        /* Given that Map keys can be references, we need
             * to ensure that they are also deeply equal */ if (aKey === aValue && bKey === bValue && compare(aKey, bKey) || compare(aKey, bKey) && compare(aValue, bValue)) {
                            unmatchedEntries--;
                            break;
                        }
                    }
                }
                return unmatchedEntries === 0;
            }
            const merged = {
                ...a,
                ...b
            };
            for (const key of [
                ...Object.getOwnPropertyNames(merged),
                ...Object.getOwnPropertySymbols(merged)
            ]){
                if (!compare(a && a[key], b && b[key])) {
                    return false;
                }
                if (key in a && !(key in b) || key in b && !(key in a)) {
                    return false;
                }
            }
            if (a instanceof WeakRef || b instanceof WeakRef) {
                if (!(a instanceof WeakRef && b instanceof WeakRef)) return false;
                return compare(a.deref(), b.deref());
            }
            return true;
        }
        return false;
    }(c, d);
}
// deno-lint-ignore ban-types
function constructorsEqual(a, b) {
    return a.constructor === b.constructor || a.constructor === Object && !b.constructor || !a.constructor && b.constructor === Object;
}
/** Make an assertion, error will be thrown if `expr` does not have truthy value. */ export function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
export function assertFalse(expr, msg = "") {
    if (expr) {
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` and `expected` are equal, deeply. If not
 * deeply equal, then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 *
 * @example
 * ```ts
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * Deno.test("example", function (): void {
 *   assertEquals("world", "world");
 *   assertEquals({ hello: "world" }, { hello: "world" });
 * });
 * ```
 */ export function assertEquals(actual, expected, msg) {
    if (equal(actual, expected)) {
        return;
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    let message = `Values are not equal${msgSuffix}`;
    const actualString = format(actual);
    const expectedString = format(expected);
    try {
        const stringDiff = typeof actual === "string" && typeof expected === "string";
        const diffResult = stringDiff ? diffstr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
        const diffMsg = buildMessage(diffResult, {
            stringDiff
        }).join("\n");
        message = `${message}\n${diffMsg}`;
    } catch  {
        message = `${message}\n${red(CAN_NOT_DISPLAY)} + \n\n`;
    }
    throw new AssertionError(message);
}
/**
 * Make an assertion that `actual` and `expected` are not equal, deeply.
 * If not then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 *
 * @example
 * ```ts
 * import { assertNotEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * assertNotEquals<number>(1, 2)
 * ```
 */ export function assertNotEquals(actual, expected, msg) {
    if (!equal(actual, expected)) {
        return;
    }
    let actualString;
    let expectedString;
    try {
        actualString = String(actual);
    } catch  {
        actualString = "[Cannot display]";
    }
    try {
        expectedString = String(expected);
    } catch  {
        expectedString = "[Cannot display]";
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    throw new AssertionError(`Expected actual: ${actualString} not to be: ${expectedString}${msgSuffix}`);
}
/**
 * Make an assertion that `actual` and `expected` are strictly equal. If
 * not then throw.
 *
 * @example
 * ```ts
 * import { assertStrictEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * Deno.test("isStrictlyEqual", function (): void {
 *   const a = {};
 *   const b = a;
 *   assertStrictEquals(a, b);
 * });
 *
 * // This test fails
 * Deno.test("isNotStrictlyEqual", function (): void {
 *   const a = {};
 *   const b = {};
 *   assertStrictEquals(a, b);
 * });
 * ```
 */ export function assertStrictEquals(actual, expected, msg) {
    if (Object.is(actual, expected)) {
        return;
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    let message;
    const actualString = format(actual);
    const expectedString = format(expected);
    if (actualString === expectedString) {
        const withOffset = actualString.split("\n").map((l)=>`    ${l}`).join("\n");
        message = `Values have the same structure but are not reference-equal${msgSuffix}\n\n${red(withOffset)}\n`;
    } else {
        try {
            const stringDiff = typeof actual === "string" && typeof expected === "string";
            const diffResult = stringDiff ? diffstr(actual, expected) : diff(actualString.split("\n"), expectedString.split("\n"));
            const diffMsg = buildMessage(diffResult, {
                stringDiff
            }).join("\n");
            message = `Values are not strictly equal${msgSuffix}\n${diffMsg}`;
        } catch  {
            message = `\n${red(CAN_NOT_DISPLAY)} + \n\n`;
        }
    }
    throw new AssertionError(message);
}
/**
 * Make an assertion that `actual` and `expected` are not strictly equal.
 * If the values are strictly equal then throw.
 *
 * ```ts
 * import { assertNotStrictEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * assertNotStrictEquals(1, 1)
 * ```
 */ export function assertNotStrictEquals(actual, expected, msg) {
    if (!Object.is(actual, expected)) {
        return;
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    throw new AssertionError(`Expected "actual" to be strictly unequal to: ${format(actual)}${msgSuffix}\n`);
}
/**
 * Make an assertion that `actual` and `expected` are almost equal numbers through
 * a given tolerance. It can be used to take into account IEEE-754 double-precision
 * floating-point representation limitations.
 * If the values are not almost equal then throw.
 *
 * @example
 * ```ts
 * import { assertAlmostEquals, assertThrows } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * assertAlmostEquals(0.1, 0.2);
 *
 * // Using a custom tolerance value
 * assertAlmostEquals(0.1 + 0.2, 0.3, 1e-16);
 * assertThrows(() => assertAlmostEquals(0.1 + 0.2, 0.3, 1e-17));
 * ```
 */ export function assertAlmostEquals(actual, expected, tolerance = 1e-7, msg) {
    if (Object.is(actual, expected)) {
        return;
    }
    const delta = Math.abs(expected - actual);
    if (delta <= tolerance) {
        return;
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    const f = (n)=>Number.isInteger(n) ? n : n.toExponential();
    throw new AssertionError(`Expected actual: "${f(actual)}" to be close to "${f(expected)}": \
delta "${f(delta)}" is greater than "${f(tolerance)}"${msgSuffix}`);
}
/**
 * Make an assertion that `obj` is an instance of `type`.
 * If not then throw.
 */ export function assertInstanceOf(actual, expectedType, msg = "") {
    if (actual instanceof expectedType) return;
    const msgSuffix = msg ? `: ${msg}` : ".";
    const expectedTypeStr = expectedType.name;
    let actualTypeStr = "";
    if (actual === null) {
        actualTypeStr = "null";
    } else if (actual === undefined) {
        actualTypeStr = "undefined";
    } else if (typeof actual === "object") {
        actualTypeStr = actual.constructor?.name ?? "Object";
    } else {
        actualTypeStr = typeof actual;
    }
    if (expectedTypeStr == actualTypeStr) {
        msg = `Expected object to be an instance of "${expectedTypeStr}"${msgSuffix}`;
    } else if (actualTypeStr == "function") {
        msg = `Expected object to be an instance of "${expectedTypeStr}" but was not an instanced object${msgSuffix}`;
    } else {
        msg = `Expected object to be an instance of "${expectedTypeStr}" but was "${actualTypeStr}"${msgSuffix}`;
    }
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `obj` is not an instance of `type`.
 * If so, then throw.
 */ export function assertNotInstanceOf(actual, // deno-lint-ignore no-explicit-any
unexpectedType, msg) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected object to not be an instance of "${typeof unexpectedType}"${msgSuffix}`;
    assertFalse(actual instanceof unexpectedType, msg);
}
/**
 * Make an assertion that actual is not null or undefined.
 * If not then throw.
 */ export function assertExists(actual, msg) {
    if (actual === undefined || actual === null) {
        const msgSuffix = msg ? `: ${msg}` : ".";
        msg = `Expected actual: "${actual}" to not be null or undefined${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that actual includes expected. If not
 * then throw.
 */ export function assertStringIncludes(actual, expected, msg) {
    if (!actual.includes(expected)) {
        const msgSuffix = msg ? `: ${msg}` : ".";
        msg = `Expected actual: "${actual}" to contain: "${expected}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` includes the `expected` values.
 * If not then an error will be thrown.
 *
 * Type parameter can be specified to ensure values under comparison have the same type.
 *
 * @example
 * ```ts
 * import { assertArrayIncludes } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts";
 *
 * assertArrayIncludes<number>([1, 2], [2])
 * ```
 */ export function assertArrayIncludes(actual, expected, msg) {
    const missing = [];
    for(let i = 0; i < expected.length; i++){
        let found = false;
        for(let j = 0; j < actual.length; j++){
            if (equal(expected[i], actual[j])) {
                found = true;
                break;
            }
        }
        if (!found) {
            missing.push(expected[i]);
        }
    }
    if (missing.length === 0) {
        return;
    }
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected actual: "${format(actual)}" to include: "${format(expected)}"${msgSuffix}\nmissing: ${format(missing)}`;
    throw new AssertionError(msg);
}
/**
 * Make an assertion that `actual` match RegExp `expected`. If not
 * then throw.
 */ export function assertMatch(actual, expected, msg) {
    if (!expected.test(actual)) {
        const msgSuffix = msg ? `: ${msg}` : ".";
        msg = `Expected actual: "${actual}" to match: "${expected}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` not match RegExp `expected`. If match
 * then throw.
 */ export function assertNotMatch(actual, expected, msg) {
    if (expected.test(actual)) {
        const msgSuffix = msg ? `: ${msg}` : ".";
        msg = `Expected actual: "${actual}" to not match: "${expected}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
/**
 * Make an assertion that `actual` object is a subset of `expected` object, deeply.
 * If not, then throw.
 */ export function assertObjectMatch(// deno-lint-ignore no-explicit-any
actual, expected, msg) {
    function filter(a, b) {
        const seen = new WeakMap();
        return fn(a, b);
        function fn(a, b) {
            // Prevent infinite loop with circular references with same filter
            if (seen.has(a) && seen.get(a) === b) {
                return a;
            }
            seen.set(a, b);
            // Filter keys and symbols which are present in both actual and expected
            const filtered = {};
            const entries = [
                ...Object.getOwnPropertyNames(a),
                ...Object.getOwnPropertySymbols(a)
            ].filter((key)=>key in b).map((key)=>[
                    key,
                    a[key]
                ]);
            for (const [key, value] of entries){
                // On array references, build a filtered array and filter nested objects inside
                if (Array.isArray(value)) {
                    const subset = b[key];
                    if (Array.isArray(subset)) {
                        filtered[key] = fn({
                            ...value
                        }, {
                            ...subset
                        });
                        continue;
                    }
                } else if (value instanceof RegExp) {
                    filtered[key] = value;
                    continue;
                } else if (typeof value === "object") {
                    const subset1 = b[key];
                    if (typeof subset1 === "object" && subset1) {
                        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
                        if (value instanceof Map && subset1 instanceof Map) {
                            filtered[key] = new Map([
                                ...value
                            ].filter(([k])=>subset1.has(k)).map(([k, v])=>[
                                    k,
                                    typeof v === "object" ? fn(v, subset1.get(k)) : v
                                ]));
                            continue;
                        }
                        // When both operands are set, build a filtered set with common values
                        if (value instanceof Set && subset1 instanceof Set) {
                            filtered[key] = new Set([
                                ...value
                            ].filter((v)=>subset1.has(v)));
                            continue;
                        }
                        filtered[key] = fn(value, subset1);
                        continue;
                    }
                }
                filtered[key] = value;
            }
            return filtered;
        }
    }
    return assertEquals(// get the intersection of "actual" and "expected"
    // side effect: all the instances' constructor field is "Object" now.
    filter(actual, expected), // set (nested) instances' constructor field to be "Object" without changing expected value.
    // see https://github.com/denoland/deno_std/pull/1419
    filter(expected, expected), msg);
}
/**
 * Forcefully throws a failed assertion
 */ export function fail(msg) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    assert(false, `Failed assertion${msgSuffix}`);
}
/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 */ export function assertIsError(error, // deno-lint-ignore no-explicit-any
ErrorClass, msgIncludes, msg) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    if (error instanceof Error === false) {
        throw new AssertionError(`Expected "error" to be an Error object${msgSuffix}}`);
    }
    if (ErrorClass && !(error instanceof ErrorClass)) {
        msg = `Expected error to be instance of "${ErrorClass.name}", but was "${typeof error === "object" ? error?.constructor?.name : "[not an object]"}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
    if (msgIncludes && (!(error instanceof Error) || !stripColor(error.message).includes(stripColor(msgIncludes)))) {
        msg = `Expected error message to include "${msgIncludes}", but got "${error instanceof Error ? error.message : "[not an Error]"}"${msgSuffix}`;
        throw new AssertionError(msg);
    }
}
export function assertThrows(fn, errorClassOrMsg, msgIncludesOrMsg, msg) {
    // deno-lint-ignore no-explicit-any
    let ErrorClass = undefined;
    let msgIncludes = undefined;
    let err;
    if (typeof errorClassOrMsg !== "string") {
        if (errorClassOrMsg === undefined || errorClassOrMsg.prototype instanceof Error || errorClassOrMsg.prototype === Error.prototype) {
            // deno-lint-ignore no-explicit-any
            ErrorClass = errorClassOrMsg;
            msgIncludes = msgIncludesOrMsg;
        } else {
            msg = msgIncludesOrMsg;
        }
    } else {
        msg = errorClassOrMsg;
    }
    let doesThrow = false;
    const msgSuffix = msg ? `: ${msg}` : ".";
    try {
        fn();
    } catch (error) {
        if (ErrorClass) {
            if (error instanceof Error === false) {
                throw new AssertionError(`A non-Error object was thrown${msgSuffix}`);
            }
            assertIsError(error, ErrorClass, msgIncludes, msg);
        }
        err = error;
        doesThrow = true;
    }
    if (!doesThrow) {
        msg = `Expected function to throw${msgSuffix}`;
        throw new AssertionError(msg);
    }
    return err;
}
export async function assertRejects(fn, errorClassOrMsg, msgIncludesOrMsg, msg) {
    // deno-lint-ignore no-explicit-any
    let ErrorClass = undefined;
    let msgIncludes = undefined;
    let err;
    if (typeof errorClassOrMsg !== "string") {
        if (errorClassOrMsg === undefined || errorClassOrMsg.prototype instanceof Error || errorClassOrMsg.prototype === Error.prototype) {
            // deno-lint-ignore no-explicit-any
            ErrorClass = errorClassOrMsg;
            msgIncludes = msgIncludesOrMsg;
        }
    } else {
        msg = errorClassOrMsg;
    }
    let doesThrow = false;
    let isPromiseReturned = false;
    const msgSuffix = msg ? `: ${msg}` : ".";
    try {
        const possiblePromise = fn();
        if (possiblePromise && typeof possiblePromise === "object" && typeof possiblePromise.then === "function") {
            isPromiseReturned = true;
            await possiblePromise;
        }
    } catch (error) {
        if (!isPromiseReturned) {
            throw new AssertionError(`Function throws when expected to reject${msgSuffix}`);
        }
        if (ErrorClass) {
            if (error instanceof Error === false) {
                throw new AssertionError(`A non-Error object was rejected${msgSuffix}`);
            }
            assertIsError(error, ErrorClass, msgIncludes, msg);
        }
        err = error;
        doesThrow = true;
    }
    if (!doesThrow) {
        throw new AssertionError(`Expected function to reject${msgSuffix}`);
    }
    return err;
}
/** Use this to stub out methods that will throw when invoked. */ export function unimplemented(msg) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    throw new AssertionError(`Unimplemented${msgSuffix}`);
}
/** Use this to assert unreachable code. */ export function unreachable() {
    throw new AssertionError("unreachable");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE4Mi4wL3Rlc3RpbmcvYXNzZXJ0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogQSBsaWJyYXJ5IG9mIGFzc2VydGlvbiBmdW5jdGlvbnMuXG4gKiBJZiB0aGUgYXNzZXJ0aW9uIGlzIGZhbHNlIGFuIGBBc3NlcnRpb25FcnJvcmAgd2lsbCBiZSB0aHJvd24gd2hpY2ggd2lsbFxuICogcmVzdWx0IGluIHByZXR0eS1wcmludGVkIGRpZmYgb2YgZmFpbGluZyBhc3NlcnRpb24uXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLCBidXQgZG8gbm90IHJlbHkgb24gZ29vZCBmb3JtYXR0aW5nIG9mXG4gKiB2YWx1ZXMgZm9yIEFzc2VydGlvbkVycm9yIG1lc3NhZ2VzIGluIGJyb3dzZXJzLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyByZWQsIHN0cmlwQ29sb3IgfSBmcm9tIFwiLi4vZm10L2NvbG9ycy50c1wiO1xuaW1wb3J0IHsgYnVpbGRNZXNzYWdlLCBkaWZmLCBkaWZmc3RyIH0gZnJvbSBcIi4vX2RpZmYudHNcIjtcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCIuL19mb3JtYXQudHNcIjtcblxuY29uc3QgQ0FOX05PVF9ESVNQTEFZID0gXCJbQ2Fubm90IGRpc3BsYXldXCI7XG5cbmV4cG9ydCBjbGFzcyBBc3NlcnRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgb3ZlcnJpZGUgbmFtZSA9IFwiQXNzZXJ0aW9uRXJyb3JcIjtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNLZXllZENvbGxlY3Rpb24oeDogdW5rbm93bik6IHggaXMgU2V0PHVua25vd24+IHtcbiAgcmV0dXJuIFtTeW1ib2wuaXRlcmF0b3IsIFwic2l6ZVwiXS5ldmVyeSgoaykgPT4gayBpbiAoeCBhcyBTZXQ8dW5rbm93bj4pKTtcbn1cblxuLyoqXG4gKiBEZWVwIGVxdWFsaXR5IGNvbXBhcmlzb24gdXNlZCBpbiBhc3NlcnRpb25zXG4gKiBAcGFyYW0gYyBhY3R1YWwgdmFsdWVcbiAqIEBwYXJhbSBkIGV4cGVjdGVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbChjOiB1bmtub3duLCBkOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGNvbnN0IHNlZW4gPSBuZXcgTWFwKCk7XG4gIHJldHVybiAoZnVuY3Rpb24gY29tcGFyZShhOiB1bmtub3duLCBiOiB1bmtub3duKTogYm9vbGVhbiB7XG4gICAgLy8gSGF2ZSB0byByZW5kZXIgUmVnRXhwICYgRGF0ZSBmb3Igc3RyaW5nIGNvbXBhcmlzb25cbiAgICAvLyB1bmxlc3MgaXQncyBtaXN0cmVhdGVkIGFzIG9iamVjdFxuICAgIGlmIChcbiAgICAgIGEgJiZcbiAgICAgIGIgJiZcbiAgICAgICgoYSBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBiIGluc3RhbmNlb2YgUmVnRXhwKSB8fFxuICAgICAgICAoYSBpbnN0YW5jZW9mIFVSTCAmJiBiIGluc3RhbmNlb2YgVVJMKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBTdHJpbmcoYSkgPT09IFN0cmluZyhiKTtcbiAgICB9XG4gICAgaWYgKGEgaW5zdGFuY2VvZiBEYXRlICYmIGIgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICBjb25zdCBhVGltZSA9IGEuZ2V0VGltZSgpO1xuICAgICAgY29uc3QgYlRpbWUgPSBiLmdldFRpbWUoKTtcbiAgICAgIC8vIENoZWNrIGZvciBOYU4gZXF1YWxpdHkgbWFudWFsbHkgc2luY2UgTmFOIGlzIG5vdFxuICAgICAgLy8gZXF1YWwgdG8gaXRzZWxmLlxuICAgICAgaWYgKE51bWJlci5pc05hTihhVGltZSkgJiYgTnVtYmVyLmlzTmFOKGJUaW1lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhVGltZSA9PT0gYlRpbWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgYiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIE51bWJlci5pc05hTihhKSAmJiBOdW1iZXIuaXNOYU4oYikgfHwgYSA9PT0gYjtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5pcyhhLCBiKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChhICYmIHR5cGVvZiBhID09PSBcIm9iamVjdFwiICYmIGIgJiYgdHlwZW9mIGIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmIChhICYmIGIgJiYgIWNvbnN0cnVjdG9yc0VxdWFsKGEsIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChhIGluc3RhbmNlb2YgV2Vha01hcCB8fCBiIGluc3RhbmNlb2YgV2Vha01hcCkge1xuICAgICAgICBpZiAoIShhIGluc3RhbmNlb2YgV2Vha01hcCAmJiBiIGluc3RhbmNlb2YgV2Vha01hcCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbm5vdCBjb21wYXJlIFdlYWtNYXAgaW5zdGFuY2VzXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGEgaW5zdGFuY2VvZiBXZWFrU2V0IHx8IGIgaW5zdGFuY2VvZiBXZWFrU2V0KSB7XG4gICAgICAgIGlmICghKGEgaW5zdGFuY2VvZiBXZWFrU2V0ICYmIGIgaW5zdGFuY2VvZiBXZWFrU2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2Fubm90IGNvbXBhcmUgV2Vha1NldCBpbnN0YW5jZXNcIik7XG4gICAgICB9XG4gICAgICBpZiAoc2Vlbi5nZXQoYSkgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoT2JqZWN0LmtleXMoYSB8fCB7fSkubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhiIHx8IHt9KS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgc2Vlbi5zZXQoYSwgYik7XG4gICAgICBpZiAoaXNLZXllZENvbGxlY3Rpb24oYSkgJiYgaXNLZXllZENvbGxlY3Rpb24oYikpIHtcbiAgICAgICAgaWYgKGEuc2l6ZSAhPT0gYi5zaXplKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVubWF0Y2hlZEVudHJpZXMgPSBhLnNpemU7XG5cbiAgICAgICAgZm9yIChjb25zdCBbYUtleSwgYVZhbHVlXSBvZiBhLmVudHJpZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgW2JLZXksIGJWYWx1ZV0gb2YgYi5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIC8qIEdpdmVuIHRoYXQgTWFwIGtleXMgY2FuIGJlIHJlZmVyZW5jZXMsIHdlIG5lZWRcbiAgICAgICAgICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZXkgYXJlIGFsc28gZGVlcGx5IGVxdWFsICovXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIChhS2V5ID09PSBhVmFsdWUgJiYgYktleSA9PT0gYlZhbHVlICYmIGNvbXBhcmUoYUtleSwgYktleSkpIHx8XG4gICAgICAgICAgICAgIChjb21wYXJlKGFLZXksIGJLZXkpICYmIGNvbXBhcmUoYVZhbHVlLCBiVmFsdWUpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHVubWF0Y2hlZEVudHJpZXMtLTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVubWF0Y2hlZEVudHJpZXMgPT09IDA7XG4gICAgICB9XG4gICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmEsIC4uLmIgfTtcbiAgICAgIGZvciAoXG4gICAgICAgIGNvbnN0IGtleSBvZiBbXG4gICAgICAgICAgLi4uT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWVyZ2VkKSxcbiAgICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG1lcmdlZCksXG4gICAgICAgIF1cbiAgICAgICkge1xuICAgICAgICB0eXBlIEtleSA9IGtleW9mIHR5cGVvZiBtZXJnZWQ7XG4gICAgICAgIGlmICghY29tcGFyZShhICYmIGFba2V5IGFzIEtleV0sIGIgJiYgYltrZXkgYXMgS2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCgoa2V5IGluIGEpICYmICghKGtleSBpbiBiKSkpIHx8ICgoa2V5IGluIGIpICYmICghKGtleSBpbiBhKSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYSBpbnN0YW5jZW9mIFdlYWtSZWYgfHwgYiBpbnN0YW5jZW9mIFdlYWtSZWYpIHtcbiAgICAgICAgaWYgKCEoYSBpbnN0YW5jZW9mIFdlYWtSZWYgJiYgYiBpbnN0YW5jZW9mIFdlYWtSZWYpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBjb21wYXJlKGEuZGVyZWYoKSwgYi5kZXJlZigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pKGMsIGQpO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIGJhbi10eXBlc1xuZnVuY3Rpb24gY29uc3RydWN0b3JzRXF1YWwoYTogb2JqZWN0LCBiOiBvYmplY3QpIHtcbiAgcmV0dXJuIGEuY29uc3RydWN0b3IgPT09IGIuY29uc3RydWN0b3IgfHxcbiAgICBhLmNvbnN0cnVjdG9yID09PSBPYmplY3QgJiYgIWIuY29uc3RydWN0b3IgfHxcbiAgICAhYS5jb25zdHJ1Y3RvciAmJiBiLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbi8qKiBNYWtlIGFuIGFzc2VydGlvbiwgZXJyb3Igd2lsbCBiZSB0aHJvd24gaWYgYGV4cHJgIGRvZXMgbm90IGhhdmUgdHJ1dGh5IHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChleHByOiB1bmtub3duLCBtc2cgPSBcIlwiKTogYXNzZXJ0cyBleHByIHtcbiAgaWYgKCFleHByKSB7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqIE1ha2UgYW4gYXNzZXJ0aW9uLCBlcnJvciB3aWxsIGJlIHRocm93biBpZiBgZXhwcmAgaGF2ZSB0cnV0aHkgdmFsdWUuICovXG50eXBlIEZhbHN5ID0gZmFsc2UgfCAwIHwgMG4gfCBcIlwiIHwgbnVsbCB8IHVuZGVmaW5lZDtcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRGYWxzZShleHByOiB1bmtub3duLCBtc2cgPSBcIlwiKTogYXNzZXJ0cyBleHByIGlzIEZhbHN5IHtcbiAgaWYgKGV4cHIpIHtcbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAgYXJlIGVxdWFsLCBkZWVwbHkuIElmIG5vdFxuICogZGVlcGx5IGVxdWFsLCB0aGVuIHRocm93LlxuICpcbiAqIFR5cGUgcGFyYW1ldGVyIGNhbiBiZSBzcGVjaWZpZWQgdG8gZW5zdXJlIHZhbHVlcyB1bmRlciBjb21wYXJpc29uIGhhdmUgdGhlIHNhbWUgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuICpcbiAqIERlbm8udGVzdChcImV4YW1wbGVcIiwgZnVuY3Rpb24gKCk6IHZvaWQge1xuICogICBhc3NlcnRFcXVhbHMoXCJ3b3JsZFwiLCBcIndvcmxkXCIpO1xuICogICBhc3NlcnRFcXVhbHMoeyBoZWxsbzogXCJ3b3JsZFwiIH0sIHsgaGVsbG86IFwid29ybGRcIiB9KTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRFcXVhbHM8VD4oYWN0dWFsOiBULCBleHBlY3RlZDogVCwgbXNnPzogc3RyaW5nKSB7XG4gIGlmIChlcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIGxldCBtZXNzYWdlID0gYFZhbHVlcyBhcmUgbm90IGVxdWFsJHttc2dTdWZmaXh9YDtcblxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuICB0cnkge1xuICAgIGNvbnN0IHN0cmluZ0RpZmYgPSAodHlwZW9mIGFjdHVhbCA9PT0gXCJzdHJpbmdcIikgJiZcbiAgICAgICh0eXBlb2YgZXhwZWN0ZWQgPT09IFwic3RyaW5nXCIpO1xuICAgIGNvbnN0IGRpZmZSZXN1bHQgPSBzdHJpbmdEaWZmXG4gICAgICA/IGRpZmZzdHIoYWN0dWFsIGFzIHN0cmluZywgZXhwZWN0ZWQgYXMgc3RyaW5nKVxuICAgICAgOiBkaWZmKGFjdHVhbFN0cmluZy5zcGxpdChcIlxcblwiKSwgZXhwZWN0ZWRTdHJpbmcuc3BsaXQoXCJcXG5cIikpO1xuICAgIGNvbnN0IGRpZmZNc2cgPSBidWlsZE1lc3NhZ2UoZGlmZlJlc3VsdCwgeyBzdHJpbmdEaWZmIH0pLmpvaW4oXCJcXG5cIik7XG4gICAgbWVzc2FnZSA9IGAke21lc3NhZ2V9XFxuJHtkaWZmTXNnfWA7XG4gIH0gY2F0Y2gge1xuICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfVxcbiR7cmVkKENBTl9OT1RfRElTUExBWSl9ICsgXFxuXFxuYDtcbiAgfVxuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobWVzc2FnZSk7XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYCBhcmUgbm90IGVxdWFsLCBkZWVwbHkuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqXG4gKiBUeXBlIHBhcmFtZXRlciBjYW4gYmUgc3BlY2lmaWVkIHRvIGVuc3VyZSB2YWx1ZXMgdW5kZXIgY29tcGFyaXNvbiBoYXZlIHRoZSBzYW1lIHR5cGUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnROb3RFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi90ZXN0aW5nL2Fzc2VydHMudHNcIjtcbiAqXG4gKiBhc3NlcnROb3RFcXVhbHM8bnVtYmVyPigxLCAyKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RFcXVhbHM8VD4oYWN0dWFsOiBULCBleHBlY3RlZDogVCwgbXNnPzogc3RyaW5nKSB7XG4gIGlmICghZXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGFjdHVhbFN0cmluZzogc3RyaW5nO1xuICBsZXQgZXhwZWN0ZWRTdHJpbmc6IHN0cmluZztcbiAgdHJ5IHtcbiAgICBhY3R1YWxTdHJpbmcgPSBTdHJpbmcoYWN0dWFsKTtcbiAgfSBjYXRjaCB7XG4gICAgYWN0dWFsU3RyaW5nID0gXCJbQ2Fubm90IGRpc3BsYXldXCI7XG4gIH1cbiAgdHJ5IHtcbiAgICBleHBlY3RlZFN0cmluZyA9IFN0cmluZyhleHBlY3RlZCk7XG4gIH0gY2F0Y2gge1xuICAgIGV4cGVjdGVkU3RyaW5nID0gXCJbQ2Fubm90IGRpc3BsYXldXCI7XG4gIH1cbiAgY29uc3QgbXNnU3VmZml4ID0gbXNnID8gYDogJHttc2d9YCA6IFwiLlwiO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXG4gICAgYEV4cGVjdGVkIGFjdHVhbDogJHthY3R1YWxTdHJpbmd9IG5vdCB0byBiZTogJHtleHBlY3RlZFN0cmluZ30ke21zZ1N1ZmZpeH1gLFxuICApO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAgYXJlIHN0cmljdGx5IGVxdWFsLiBJZlxuICogbm90IHRoZW4gdGhyb3cuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRTdHJpY3RFcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi90ZXN0aW5nL2Fzc2VydHMudHNcIjtcbiAqXG4gKiBEZW5vLnRlc3QoXCJpc1N0cmljdGx5RXF1YWxcIiwgZnVuY3Rpb24gKCk6IHZvaWQge1xuICogICBjb25zdCBhID0ge307XG4gKiAgIGNvbnN0IGIgPSBhO1xuICogICBhc3NlcnRTdHJpY3RFcXVhbHMoYSwgYik7XG4gKiB9KTtcbiAqXG4gKiAvLyBUaGlzIHRlc3QgZmFpbHNcbiAqIERlbm8udGVzdChcImlzTm90U3RyaWN0bHlFcXVhbFwiLCBmdW5jdGlvbiAoKTogdm9pZCB7XG4gKiAgIGNvbnN0IGEgPSB7fTtcbiAqICAgY29uc3QgYiA9IHt9O1xuICogICBhc3NlcnRTdHJpY3RFcXVhbHMoYSwgYik7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0U3RyaWN0RXF1YWxzPFQ+KFxuICBhY3R1YWw6IHVua25vd24sXG4gIGV4cGVjdGVkOiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBUIHtcbiAgaWYgKE9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgbGV0IG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdCBhY3R1YWxTdHJpbmcgPSBmb3JtYXQoYWN0dWFsKTtcbiAgY29uc3QgZXhwZWN0ZWRTdHJpbmcgPSBmb3JtYXQoZXhwZWN0ZWQpO1xuXG4gIGlmIChhY3R1YWxTdHJpbmcgPT09IGV4cGVjdGVkU3RyaW5nKSB7XG4gICAgY29uc3Qgd2l0aE9mZnNldCA9IGFjdHVhbFN0cmluZ1xuICAgICAgLnNwbGl0KFwiXFxuXCIpXG4gICAgICAubWFwKChsKSA9PiBgICAgICR7bH1gKVxuICAgICAgLmpvaW4oXCJcXG5cIik7XG4gICAgbWVzc2FnZSA9XG4gICAgICBgVmFsdWVzIGhhdmUgdGhlIHNhbWUgc3RydWN0dXJlIGJ1dCBhcmUgbm90IHJlZmVyZW5jZS1lcXVhbCR7bXNnU3VmZml4fVxcblxcbiR7XG4gICAgICAgIHJlZCh3aXRoT2Zmc2V0KVxuICAgICAgfVxcbmA7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0cmluZ0RpZmYgPSAodHlwZW9mIGFjdHVhbCA9PT0gXCJzdHJpbmdcIikgJiZcbiAgICAgICAgKHR5cGVvZiBleHBlY3RlZCA9PT0gXCJzdHJpbmdcIik7XG4gICAgICBjb25zdCBkaWZmUmVzdWx0ID0gc3RyaW5nRGlmZlxuICAgICAgICA/IGRpZmZzdHIoYWN0dWFsIGFzIHN0cmluZywgZXhwZWN0ZWQgYXMgc3RyaW5nKVxuICAgICAgICA6IGRpZmYoYWN0dWFsU3RyaW5nLnNwbGl0KFwiXFxuXCIpLCBleHBlY3RlZFN0cmluZy5zcGxpdChcIlxcblwiKSk7XG4gICAgICBjb25zdCBkaWZmTXNnID0gYnVpbGRNZXNzYWdlKGRpZmZSZXN1bHQsIHsgc3RyaW5nRGlmZiB9KS5qb2luKFwiXFxuXCIpO1xuICAgICAgbWVzc2FnZSA9IGBWYWx1ZXMgYXJlIG5vdCBzdHJpY3RseSBlcXVhbCR7bXNnU3VmZml4fVxcbiR7ZGlmZk1zZ31gO1xuICAgIH0gY2F0Y2gge1xuICAgICAgbWVzc2FnZSA9IGBcXG4ke3JlZChDQU5fTk9UX0RJU1BMQVkpfSArIFxcblxcbmA7XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1lc3NhZ2UpO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAgYXJlIG5vdCBzdHJpY3RseSBlcXVhbC5cbiAqIElmIHRoZSB2YWx1ZXMgYXJlIHN0cmljdGx5IGVxdWFsIHRoZW4gdGhyb3cuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydE5vdFN0cmljdEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuICpcbiAqIGFzc2VydE5vdFN0cmljdEVxdWFscygxLCAxKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RTdHJpY3RFcXVhbHM8VD4oXG4gIGFjdHVhbDogVCxcbiAgZXhwZWN0ZWQ6IFQsXG4gIG1zZz86IHN0cmluZyxcbikge1xuICBpZiAoIU9iamVjdC5pcyhhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgIGBFeHBlY3RlZCBcImFjdHVhbFwiIHRvIGJlIHN0cmljdGx5IHVuZXF1YWwgdG86ICR7XG4gICAgICBmb3JtYXQoYWN0dWFsKVxuICAgIH0ke21zZ1N1ZmZpeH1cXG5gLFxuICApO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAgYXJlIGFsbW9zdCBlcXVhbCBudW1iZXJzIHRocm91Z2hcbiAqIGEgZ2l2ZW4gdG9sZXJhbmNlLiBJdCBjYW4gYmUgdXNlZCB0byB0YWtlIGludG8gYWNjb3VudCBJRUVFLTc1NCBkb3VibGUtcHJlY2lzaW9uXG4gKiBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiBsaW1pdGF0aW9ucy5cbiAqIElmIHRoZSB2YWx1ZXMgYXJlIG5vdCBhbG1vc3QgZXF1YWwgdGhlbiB0aHJvdy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydEFsbW9zdEVxdWFscywgYXNzZXJ0VGhyb3dzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vdGVzdGluZy9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0QWxtb3N0RXF1YWxzKDAuMSwgMC4yKTtcbiAqXG4gKiAvLyBVc2luZyBhIGN1c3RvbSB0b2xlcmFuY2UgdmFsdWVcbiAqIGFzc2VydEFsbW9zdEVxdWFscygwLjEgKyAwLjIsIDAuMywgMWUtMTYpO1xuICogYXNzZXJ0VGhyb3dzKCgpID0+IGFzc2VydEFsbW9zdEVxdWFscygwLjEgKyAwLjIsIDAuMywgMWUtMTcpKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0QWxtb3N0RXF1YWxzKFxuICBhY3R1YWw6IG51bWJlcixcbiAgZXhwZWN0ZWQ6IG51bWJlcixcbiAgdG9sZXJhbmNlID0gMWUtNyxcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGlmIChPYmplY3QuaXMoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZGVsdGEgPSBNYXRoLmFicyhleHBlY3RlZCAtIGFjdHVhbCk7XG4gIGlmIChkZWx0YSA8PSB0b2xlcmFuY2UpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIGNvbnN0IGYgPSAobjogbnVtYmVyKSA9PiBOdW1iZXIuaXNJbnRlZ2VyKG4pID8gbiA6IG4udG9FeHBvbmVudGlhbCgpO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXG4gICAgYEV4cGVjdGVkIGFjdHVhbDogXCIke2YoYWN0dWFsKX1cIiB0byBiZSBjbG9zZSB0byBcIiR7ZihleHBlY3RlZCl9XCI6IFxcXG5kZWx0YSBcIiR7ZihkZWx0YSl9XCIgaXMgZ3JlYXRlciB0aGFuIFwiJHtmKHRvbGVyYW5jZSl9XCIke21zZ1N1ZmZpeH1gLFxuICApO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxudHlwZSBBbnlDb25zdHJ1Y3RvciA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueTtcbnR5cGUgR2V0Q29uc3RydWN0b3JUeXBlPFQgZXh0ZW5kcyBBbnlDb25zdHJ1Y3Rvcj4gPSBUIGV4dGVuZHMgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbm5ldyAoLi4uYXJnczogYW55KSA9PiBpbmZlciBDID8gQ1xuICA6IG5ldmVyO1xuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYG9iamAgaXMgYW4gaW5zdGFuY2Ugb2YgYHR5cGVgLlxuICogSWYgbm90IHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbnN0YW5jZU9mPFQgZXh0ZW5kcyBBbnlDb25zdHJ1Y3Rvcj4oXG4gIGFjdHVhbDogdW5rbm93bixcbiAgZXhwZWN0ZWRUeXBlOiBULFxuICBtc2cgPSBcIlwiLFxuKTogYXNzZXJ0cyBhY3R1YWwgaXMgR2V0Q29uc3RydWN0b3JUeXBlPFQ+IHtcbiAgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkVHlwZSkgcmV0dXJuO1xuXG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgY29uc3QgZXhwZWN0ZWRUeXBlU3RyID0gZXhwZWN0ZWRUeXBlLm5hbWU7XG5cbiAgbGV0IGFjdHVhbFR5cGVTdHIgPSBcIlwiO1xuICBpZiAoYWN0dWFsID09PSBudWxsKSB7XG4gICAgYWN0dWFsVHlwZVN0ciA9IFwibnVsbFwiO1xuICB9IGVsc2UgaWYgKGFjdHVhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYWN0dWFsVHlwZVN0ciA9IFwidW5kZWZpbmVkXCI7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCA9PT0gXCJvYmplY3RcIikge1xuICAgIGFjdHVhbFR5cGVTdHIgPSBhY3R1YWwuY29uc3RydWN0b3I/Lm5hbWUgPz8gXCJPYmplY3RcIjtcbiAgfSBlbHNlIHtcbiAgICBhY3R1YWxUeXBlU3RyID0gdHlwZW9mIGFjdHVhbDtcbiAgfVxuXG4gIGlmIChleHBlY3RlZFR5cGVTdHIgPT0gYWN0dWFsVHlwZVN0cikge1xuICAgIG1zZyA9XG4gICAgICBgRXhwZWN0ZWQgb2JqZWN0IHRvIGJlIGFuIGluc3RhbmNlIG9mIFwiJHtleHBlY3RlZFR5cGVTdHJ9XCIke21zZ1N1ZmZpeH1gO1xuICB9IGVsc2UgaWYgKGFjdHVhbFR5cGVTdHIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgbXNnID1cbiAgICAgIGBFeHBlY3RlZCBvYmplY3QgdG8gYmUgYW4gaW5zdGFuY2Ugb2YgXCIke2V4cGVjdGVkVHlwZVN0cn1cIiBidXQgd2FzIG5vdCBhbiBpbnN0YW5jZWQgb2JqZWN0JHttc2dTdWZmaXh9YDtcbiAgfSBlbHNlIHtcbiAgICBtc2cgPVxuICAgICAgYEV4cGVjdGVkIG9iamVjdCB0byBiZSBhbiBpbnN0YW5jZSBvZiBcIiR7ZXhwZWN0ZWRUeXBlU3RyfVwiIGJ1dCB3YXMgXCIke2FjdHVhbFR5cGVTdHJ9XCIke21zZ1N1ZmZpeH1gO1xuICB9XG5cbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgb2JqYCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgYHR5cGVgLlxuICogSWYgc28sIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RJbnN0YW5jZU9mPEEsIFQ+KFxuICBhY3R1YWw6IEEsXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIHVuZXhwZWN0ZWRUeXBlOiBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBFeGNsdWRlPEEsIFQ+IHtcbiAgY29uc3QgbXNnU3VmZml4ID0gbXNnID8gYDogJHttc2d9YCA6IFwiLlwiO1xuICBtc2cgPVxuICAgIGBFeHBlY3RlZCBvYmplY3QgdG8gbm90IGJlIGFuIGluc3RhbmNlIG9mIFwiJHt0eXBlb2YgdW5leHBlY3RlZFR5cGV9XCIke21zZ1N1ZmZpeH1gO1xuICBhc3NlcnRGYWxzZShhY3R1YWwgaW5zdGFuY2VvZiB1bmV4cGVjdGVkVHlwZSwgbXNnKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGFjdHVhbCBpcyBub3QgbnVsbCBvciB1bmRlZmluZWQuXG4gKiBJZiBub3QgdGhlbiB0aHJvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEV4aXN0czxUPihcbiAgYWN0dWFsOiBULFxuICBtc2c/OiBzdHJpbmcsXG4pOiBhc3NlcnRzIGFjdHVhbCBpcyBOb25OdWxsYWJsZTxUPiB7XG4gIGlmIChhY3R1YWwgPT09IHVuZGVmaW5lZCB8fCBhY3R1YWwgPT09IG51bGwpIHtcbiAgICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gICAgbXNnID1cbiAgICAgIGBFeHBlY3RlZCBhY3R1YWw6IFwiJHthY3R1YWx9XCIgdG8gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJHttc2dTdWZmaXh9YDtcbiAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbiAgfVxufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYWN0dWFsIGluY2x1ZGVzIGV4cGVjdGVkLiBJZiBub3RcbiAqIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRTdHJpbmdJbmNsdWRlcyhcbiAgYWN0dWFsOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbikge1xuICBpZiAoIWFjdHVhbC5pbmNsdWRlcyhleHBlY3RlZCkpIHtcbiAgICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gICAgbXNnID0gYEV4cGVjdGVkIGFjdHVhbDogXCIke2FjdHVhbH1cIiB0byBjb250YWluOiBcIiR7ZXhwZWN0ZWR9XCIke21zZ1N1ZmZpeH1gO1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xuICB9XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBpbmNsdWRlcyB0aGUgYGV4cGVjdGVkYCB2YWx1ZXMuXG4gKiBJZiBub3QgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAqXG4gKiBUeXBlIHBhcmFtZXRlciBjYW4gYmUgc3BlY2lmaWVkIHRvIGVuc3VyZSB2YWx1ZXMgdW5kZXIgY29tcGFyaXNvbiBoYXZlIHRoZSBzYW1lIHR5cGUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRBcnJheUluY2x1ZGVzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vdGVzdGluZy9hc3NlcnRzLnRzXCI7XG4gKlxuICogYXNzZXJ0QXJyYXlJbmNsdWRlczxudW1iZXI+KFsxLCAyXSwgWzJdKVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRBcnJheUluY2x1ZGVzPFQ+KFxuICBhY3R1YWw6IEFycmF5TGlrZTxUPixcbiAgZXhwZWN0ZWQ6IEFycmF5TGlrZTxUPixcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIGNvbnN0IG1pc3Npbmc6IHVua25vd25bXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBhY3R1YWwubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChlcXVhbChleHBlY3RlZFtpXSwgYWN0dWFsW2pdKSkge1xuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWZvdW5kKSB7XG4gICAgICBtaXNzaW5nLnB1c2goZXhwZWN0ZWRbaV0pO1xuICAgIH1cbiAgfVxuICBpZiAobWlzc2luZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIG1zZyA9IGBFeHBlY3RlZCBhY3R1YWw6IFwiJHtmb3JtYXQoYWN0dWFsKX1cIiB0byBpbmNsdWRlOiBcIiR7XG4gICAgZm9ybWF0KGV4cGVjdGVkKVxuICB9XCIke21zZ1N1ZmZpeH1cXG5taXNzaW5nOiAke2Zvcm1hdChtaXNzaW5nKX1gO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIG1hdGNoIFJlZ0V4cCBgZXhwZWN0ZWRgLiBJZiBub3RcbiAqIHRoZW4gdGhyb3cuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRNYXRjaChcbiAgYWN0dWFsOiBzdHJpbmcsXG4gIGV4cGVjdGVkOiBSZWdFeHAsXG4gIG1zZz86IHN0cmluZyxcbikge1xuICBpZiAoIWV4cGVjdGVkLnRlc3QoYWN0dWFsKSkge1xuICAgIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgICBtc2cgPSBgRXhwZWN0ZWQgYWN0dWFsOiBcIiR7YWN0dWFsfVwiIHRvIG1hdGNoOiBcIiR7ZXhwZWN0ZWR9XCIke21zZ1N1ZmZpeH1gO1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xuICB9XG59XG5cbi8qKlxuICogTWFrZSBhbiBhc3NlcnRpb24gdGhhdCBgYWN0dWFsYCBub3QgbWF0Y2ggUmVnRXhwIGBleHBlY3RlZGAuIElmIG1hdGNoXG4gKiB0aGVuIHRocm93LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm90TWF0Y2goXG4gIGFjdHVhbDogc3RyaW5nLFxuICBleHBlY3RlZDogUmVnRXhwLFxuICBtc2c/OiBzdHJpbmcsXG4pIHtcbiAgaWYgKGV4cGVjdGVkLnRlc3QoYWN0dWFsKSkge1xuICAgIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgICBtc2cgPVxuICAgICAgYEV4cGVjdGVkIGFjdHVhbDogXCIke2FjdHVhbH1cIiB0byBub3QgbWF0Y2g6IFwiJHtleHBlY3RlZH1cIiR7bXNnU3VmZml4fWA7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBNYWtlIGFuIGFzc2VydGlvbiB0aGF0IGBhY3R1YWxgIG9iamVjdCBpcyBhIHN1YnNldCBvZiBgZXhwZWN0ZWRgIG9iamVjdCwgZGVlcGx5LlxuICogSWYgbm90LCB0aGVuIHRocm93LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0T2JqZWN0TWF0Y2goXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGFjdHVhbDogUmVjb3JkPFByb3BlcnR5S2V5LCBhbnk+LFxuICBleHBlY3RlZDogUmVjb3JkPFByb3BlcnR5S2V5LCB1bmtub3duPixcbiAgbXNnPzogc3RyaW5nLFxuKSB7XG4gIHR5cGUgbG9vc2UgPSBSZWNvcmQ8UHJvcGVydHlLZXksIHVua25vd24+O1xuXG4gIGZ1bmN0aW9uIGZpbHRlcihhOiBsb29zZSwgYjogbG9vc2UpIHtcbiAgICBjb25zdCBzZWVuID0gbmV3IFdlYWtNYXAoKTtcbiAgICByZXR1cm4gZm4oYSwgYik7XG5cbiAgICBmdW5jdGlvbiBmbihhOiBsb29zZSwgYjogbG9vc2UpOiBsb29zZSB7XG4gICAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3Agd2l0aCBjaXJjdWxhciByZWZlcmVuY2VzIHdpdGggc2FtZSBmaWx0ZXJcbiAgICAgIGlmICgoc2Vlbi5oYXMoYSkpICYmIChzZWVuLmdldChhKSA9PT0gYikpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9XG4gICAgICBzZWVuLnNldChhLCBiKTtcbiAgICAgIC8vIEZpbHRlciBrZXlzIGFuZCBzeW1ib2xzIHdoaWNoIGFyZSBwcmVzZW50IGluIGJvdGggYWN0dWFsIGFuZCBleHBlY3RlZFxuICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fSBhcyBsb29zZTtcbiAgICAgIGNvbnN0IGVudHJpZXMgPSBbXG4gICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGEpLFxuICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGEpLFxuICAgICAgXVxuICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSBpbiBiKVxuICAgICAgICAubWFwKChrZXkpID0+IFtrZXksIGFba2V5IGFzIHN0cmluZ11dKSBhcyBBcnJheTxbc3RyaW5nLCB1bmtub3duXT47XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKSB7XG4gICAgICAgIC8vIE9uIGFycmF5IHJlZmVyZW5jZXMsIGJ1aWxkIGEgZmlsdGVyZWQgYXJyYXkgYW5kIGZpbHRlciBuZXN0ZWQgb2JqZWN0cyBpbnNpZGVcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgY29uc3Qgc3Vic2V0ID0gKGIgYXMgbG9vc2UpW2tleV07XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc3Vic2V0KSkge1xuICAgICAgICAgICAgZmlsdGVyZWRba2V5XSA9IGZuKHsgLi4udmFsdWUgfSwgeyAuLi5zdWJzZXQgfSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gLy8gT24gcmVnZXhwIHJlZmVyZW5jZXMsIGtlZXAgdmFsdWUgYXMgaXQgdG8gYXZvaWQgbG9vc2luZyBwYXR0ZXJuIGFuZCBmbGFnc1xuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSAvLyBPbiBuZXN0ZWQgb2JqZWN0cyByZWZlcmVuY2VzLCBidWlsZCBhIGZpbHRlcmVkIG9iamVjdCByZWN1cnNpdmVseVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBjb25zdCBzdWJzZXQgPSAoYiBhcyBsb29zZSlba2V5XTtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBzdWJzZXQgPT09IFwib2JqZWN0XCIpICYmIChzdWJzZXQpKSB7XG4gICAgICAgICAgICAvLyBXaGVuIGJvdGggb3BlcmFuZHMgYXJlIG1hcHMsIGJ1aWxkIGEgZmlsdGVyZWQgbWFwIHdpdGggY29tbW9uIGtleXMgYW5kIGZpbHRlciBuZXN0ZWQgb2JqZWN0cyBpbnNpZGVcbiAgICAgICAgICAgIGlmICgodmFsdWUgaW5zdGFuY2VvZiBNYXApICYmIChzdWJzZXQgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSBuZXcgTWFwKFxuICAgICAgICAgICAgICAgIFsuLi52YWx1ZV0uZmlsdGVyKChba10pID0+IHN1YnNldC5oYXMoaykpLm1hcCgoXG4gICAgICAgICAgICAgICAgICBbaywgdl0sXG4gICAgICAgICAgICAgICAgKSA9PiBbaywgdHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBmbih2LCBzdWJzZXQuZ2V0KGspKSA6IHZdKSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXaGVuIGJvdGggb3BlcmFuZHMgYXJlIHNldCwgYnVpbGQgYSBmaWx0ZXJlZCBzZXQgd2l0aCBjb21tb24gdmFsdWVzXG4gICAgICAgICAgICBpZiAoKHZhbHVlIGluc3RhbmNlb2YgU2V0KSAmJiAoc3Vic2V0IGluc3RhbmNlb2YgU2V0KSkge1xuICAgICAgICAgICAgICBmaWx0ZXJlZFtrZXldID0gbmV3IFNldChbLi4udmFsdWVdLmZpbHRlcigodikgPT4gc3Vic2V0Lmhhcyh2KSkpO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbHRlcmVkW2tleV0gPSBmbih2YWx1ZSBhcyBsb29zZSwgc3Vic2V0IGFzIGxvb3NlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWx0ZXJlZFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBhc3NlcnRFcXVhbHMoXG4gICAgLy8gZ2V0IHRoZSBpbnRlcnNlY3Rpb24gb2YgXCJhY3R1YWxcIiBhbmQgXCJleHBlY3RlZFwiXG4gICAgLy8gc2lkZSBlZmZlY3Q6IGFsbCB0aGUgaW5zdGFuY2VzJyBjb25zdHJ1Y3RvciBmaWVsZCBpcyBcIk9iamVjdFwiIG5vdy5cbiAgICBmaWx0ZXIoYWN0dWFsLCBleHBlY3RlZCksXG4gICAgLy8gc2V0IChuZXN0ZWQpIGluc3RhbmNlcycgY29uc3RydWN0b3IgZmllbGQgdG8gYmUgXCJPYmplY3RcIiB3aXRob3V0IGNoYW5naW5nIGV4cGVjdGVkIHZhbHVlLlxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvZGVub19zdGQvcHVsbC8xNDE5XG4gICAgZmlsdGVyKGV4cGVjdGVkLCBleHBlY3RlZCksXG4gICAgbXNnLFxuICApO1xufVxuXG4vKipcbiAqIEZvcmNlZnVsbHkgdGhyb3dzIGEgZmFpbGVkIGFzc2VydGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZmFpbChtc2c/OiBzdHJpbmcpOiBuZXZlciB7XG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgYXNzZXJ0KGZhbHNlLCBgRmFpbGVkIGFzc2VydGlvbiR7bXNnU3VmZml4fWApO1xufVxuXG4vKipcbiAqIE1ha2UgYW4gYXNzZXJ0aW9uIHRoYXQgYGVycm9yYCBpcyBhbiBgRXJyb3JgLlxuICogSWYgbm90IHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKiBBbiBlcnJvciBjbGFzcyBhbmQgYSBzdHJpbmcgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiBlcnJvciBtZXNzYWdlIGNhbiBhbHNvIGJlIGFzc2VydGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SXNFcnJvcjxFIGV4dGVuZHMgRXJyb3IgPSBFcnJvcj4oXG4gIGVycm9yOiB1bmtub3duLFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBFcnJvckNsYXNzPzogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSxcbiAgbXNnSW5jbHVkZXM/OiBzdHJpbmcsXG4gIG1zZz86IHN0cmluZyxcbik6IGFzc2VydHMgZXJyb3IgaXMgRSB7XG4gIGNvbnN0IG1zZ1N1ZmZpeCA9IG1zZyA/IGA6ICR7bXNnfWAgOiBcIi5cIjtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFxuICAgICAgYEV4cGVjdGVkIFwiZXJyb3JcIiB0byBiZSBhbiBFcnJvciBvYmplY3Qke21zZ1N1ZmZpeH19YCxcbiAgICApO1xuICB9XG4gIGlmIChFcnJvckNsYXNzICYmICEoZXJyb3IgaW5zdGFuY2VvZiBFcnJvckNsYXNzKSkge1xuICAgIG1zZyA9IGBFeHBlY3RlZCBlcnJvciB0byBiZSBpbnN0YW5jZSBvZiBcIiR7RXJyb3JDbGFzcy5uYW1lfVwiLCBidXQgd2FzIFwiJHtcbiAgICAgIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiA/IGVycm9yPy5jb25zdHJ1Y3Rvcj8ubmFtZSA6IFwiW25vdCBhbiBvYmplY3RdXCJcbiAgICB9XCIke21zZ1N1ZmZpeH1gO1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihtc2cpO1xuICB9XG4gIGlmIChcbiAgICBtc2dJbmNsdWRlcyAmJiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB8fFxuICAgICAgIXN0cmlwQ29sb3IoZXJyb3IubWVzc2FnZSkuaW5jbHVkZXMoc3RyaXBDb2xvcihtc2dJbmNsdWRlcykpKVxuICApIHtcbiAgICBtc2cgPSBgRXhwZWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBpbmNsdWRlIFwiJHttc2dJbmNsdWRlc31cIiwgYnV0IGdvdCBcIiR7XG4gICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiW25vdCBhbiBFcnJvcl1cIlxuICAgIH1cIiR7bXNnU3VmZml4fWA7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uLCBleHBlY3RpbmcgaXQgdG8gdGhyb3cuIElmIGl0IGRvZXMgbm90LCB0aGVuIGl0XG4gKiB0aHJvd3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRUaHJvd3MgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi90ZXN0aW5nL2Fzc2VydHMudHNcIjtcbiAqXG4gKiBEZW5vLnRlc3QoXCJkb2VzVGhyb3dcIiwgZnVuY3Rpb24gKCk6IHZvaWQge1xuICogICBhc3NlcnRUaHJvd3MoKCk6IHZvaWQgPT4ge1xuICogICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJoZWxsbyB3b3JsZCFcIik7XG4gKiAgIH0pO1xuICogfSk7XG4gKlxuICogLy8gVGhpcyB0ZXN0IHdpbGwgbm90IHBhc3MuXG4gKiBEZW5vLnRlc3QoXCJmYWlsc1wiLCBmdW5jdGlvbiAoKTogdm9pZCB7XG4gKiAgIGFzc2VydFRocm93cygoKTogdm9pZCA9PiB7XG4gKiAgICAgY29uc29sZS5sb2coXCJIZWxsbyB3b3JsZFwiKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VGhyb3dzKFxuICBmbjogKCkgPT4gdW5rbm93bixcbiAgbXNnPzogc3RyaW5nLFxuKTogdW5rbm93bjtcbi8qKlxuICogRXhlY3V0ZXMgYSBmdW5jdGlvbiwgZXhwZWN0aW5nIGl0IHRvIHRocm93LiBJZiBpdCBkb2VzIG5vdCwgdGhlbiBpdFxuICogdGhyb3dzLiBBbiBlcnJvciBjbGFzcyBhbmQgYSBzdHJpbmcgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiBlcnJvciBtZXNzYWdlIGNhbiBhbHNvIGJlIGFzc2VydGVkLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGFzc2VydFRocm93cyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuICpcbiAqIERlbm8udGVzdChcImRvZXNUaHJvd1wiLCBmdW5jdGlvbiAoKTogdm9pZCB7XG4gKiAgIGFzc2VydFRocm93cygoKTogdm9pZCA9PiB7XG4gKiAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImhlbGxvIHdvcmxkIVwiKTtcbiAqICAgfSwgVHlwZUVycm9yKTtcbiAqICAgYXNzZXJ0VGhyb3dzKFxuICogICAgICgpOiB2b2lkID0+IHtcbiAqICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJoZWxsbyB3b3JsZCFcIik7XG4gKiAgICAgfSxcbiAqICAgICBUeXBlRXJyb3IsXG4gKiAgICAgXCJoZWxsb1wiLFxuICogICApO1xuICogfSk7XG4gKlxuICogLy8gVGhpcyB0ZXN0IHdpbGwgbm90IHBhc3MuXG4gKiBEZW5vLnRlc3QoXCJmYWlsc1wiLCBmdW5jdGlvbiAoKTogdm9pZCB7XG4gKiAgIGFzc2VydFRocm93cygoKTogdm9pZCA9PiB7XG4gKiAgICAgY29uc29sZS5sb2coXCJIZWxsbyB3b3JsZFwiKTtcbiAqICAgfSk7XG4gKiB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VGhyb3dzPEUgZXh0ZW5kcyBFcnJvciA9IEVycm9yPihcbiAgZm46ICgpID0+IHVua25vd24sXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIEVycm9yQ2xhc3M6IG5ldyAoLi4uYXJnczogYW55W10pID0+IEUsXG4gIG1zZ0luY2x1ZGVzPzogc3RyaW5nLFxuICBtc2c/OiBzdHJpbmcsXG4pOiBFO1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFRocm93czxFIGV4dGVuZHMgRXJyb3IgPSBFcnJvcj4oXG4gIGZuOiAoKSA9PiB1bmtub3duLFxuICBlcnJvckNsYXNzT3JNc2c/OlxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgfCAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSlcbiAgICB8IHN0cmluZyxcbiAgbXNnSW5jbHVkZXNPck1zZz86IHN0cmluZyxcbiAgbXNnPzogc3RyaW5nLFxuKTogRSB8IEVycm9yIHwgdW5rbm93biB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGxldCBFcnJvckNsYXNzOiAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBtc2dJbmNsdWRlczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgZXJyO1xuXG4gIGlmICh0eXBlb2YgZXJyb3JDbGFzc09yTXNnICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKFxuICAgICAgZXJyb3JDbGFzc09yTXNnID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGVycm9yQ2xhc3NPck1zZy5wcm90b3R5cGUgaW5zdGFuY2VvZiBFcnJvciB8fFxuICAgICAgZXJyb3JDbGFzc09yTXNnLnByb3RvdHlwZSA9PT0gRXJyb3IucHJvdG90eXBlXG4gICAgKSB7XG4gICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgRXJyb3JDbGFzcyA9IGVycm9yQ2xhc3NPck1zZyBhcyBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBFO1xuICAgICAgbXNnSW5jbHVkZXMgPSBtc2dJbmNsdWRlc09yTXNnO1xuICAgIH0gZWxzZSB7XG4gICAgICBtc2cgPSBtc2dJbmNsdWRlc09yTXNnO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtc2cgPSBlcnJvckNsYXNzT3JNc2c7XG4gIH1cbiAgbGV0IGRvZXNUaHJvdyA9IGZhbHNlO1xuICBjb25zdCBtc2dTdWZmaXggPSBtc2cgPyBgOiAke21zZ31gIDogXCIuXCI7XG4gIHRyeSB7XG4gICAgZm4oKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoRXJyb3JDbGFzcykge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihgQSBub24tRXJyb3Igb2JqZWN0IHdhcyB0aHJvd24ke21zZ1N1ZmZpeH1gKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydElzRXJyb3IoXG4gICAgICAgIGVycm9yLFxuICAgICAgICBFcnJvckNsYXNzLFxuICAgICAgICBtc2dJbmNsdWRlcyxcbiAgICAgICAgbXNnLFxuICAgICAgKTtcbiAgICB9XG4gICAgZXJyID0gZXJyb3I7XG4gICAgZG9lc1Rocm93ID0gdHJ1ZTtcbiAgfVxuICBpZiAoIWRvZXNUaHJvdykge1xuICAgIG1zZyA9IGBFeHBlY3RlZCBmdW5jdGlvbiB0byB0aHJvdyR7bXNnU3VmZml4fWA7XG4gICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKG1zZyk7XG4gIH1cbiAgcmV0dXJuIGVycjtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBwcm9taXNlLCBleHBlY3RpbmcgaXQgdG8gcmVqZWN0LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgYXNzZXJ0UmVqZWN0cyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3Rlc3RpbmcvYXNzZXJ0cy50c1wiO1xuICpcbiAqIERlbm8udGVzdChcImRvZXNUaHJvd1wiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gKiAgIGF3YWl0IGFzc2VydFJlamVjdHMoXG4gKiAgICAgYXN5bmMgKCkgPT4ge1xuICogICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImhlbGxvIHdvcmxkIVwiKTtcbiAqICAgICB9LFxuICogICApO1xuICogICBhd2FpdCBhc3NlcnRSZWplY3RzKFxuICogICAgIGFzeW5jICgpID0+IHtcbiAqICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoKSk7XG4gKiAgICAgfSxcbiAqICAgKTtcbiAqIH0pO1xuICpcbiAqIC8vIFRoaXMgdGVzdCB3aWxsIG5vdCBwYXNzLlxuICogRGVuby50ZXN0KFwiZmFpbHNcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICBhd2FpdCBhc3NlcnRSZWplY3RzKFxuICogICAgIGFzeW5jICgpID0+IHtcbiAqICAgICAgIGNvbnNvbGUubG9nKFwiSGVsbG8gd29ybGRcIik7XG4gKiAgICAgfSxcbiAqICAgKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRSZWplY3RzKFxuICBmbjogKCkgPT4gUHJvbWlzZUxpa2U8dW5rbm93bj4sXG4gIG1zZz86IHN0cmluZyxcbik6IFByb21pc2U8dW5rbm93bj47XG4vKipcbiAqIEV4ZWN1dGVzIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHByb21pc2UsIGV4cGVjdGluZyBpdCB0byByZWplY3QuXG4gKiBJZiBpdCBkb2VzIG5vdCwgdGhlbiBpdCB0aHJvd3MuIEFuIGVycm9yIGNsYXNzIGFuZCBhIHN0cmluZyB0aGF0IHNob3VsZCBiZVxuICogaW5jbHVkZWQgaW4gdGhlIGVycm9yIG1lc3NhZ2UgY2FuIGFsc28gYmUgYXNzZXJ0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBhc3NlcnRSZWplY3RzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vdGVzdGluZy9hc3NlcnRzLnRzXCI7XG4gKlxuICogRGVuby50ZXN0KFwiZG9lc1Rocm93XCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAqICAgYXdhaXQgYXNzZXJ0UmVqZWN0cyhhc3luYyAoKSA9PiB7XG4gKiAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImhlbGxvIHdvcmxkIVwiKTtcbiAqICAgfSwgVHlwZUVycm9yKTtcbiAqICAgYXdhaXQgYXNzZXJ0UmVqZWN0cyhcbiAqICAgICBhc3luYyAoKSA9PiB7XG4gKiAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiaGVsbG8gd29ybGQhXCIpO1xuICogICAgIH0sXG4gKiAgICAgVHlwZUVycm9yLFxuICogICAgIFwiaGVsbG9cIixcbiAqICAgKTtcbiAqIH0pO1xuICpcbiAqIC8vIFRoaXMgdGVzdCB3aWxsIG5vdCBwYXNzLlxuICogRGVuby50ZXN0KFwiZmFpbHNcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICogICBhd2FpdCBhc3NlcnRSZWplY3RzKFxuICogICAgIGFzeW5jICgpID0+IHtcbiAqICAgICAgIGNvbnNvbGUubG9nKFwiSGVsbG8gd29ybGRcIik7XG4gKiAgICAgfSxcbiAqICAgKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRSZWplY3RzPEUgZXh0ZW5kcyBFcnJvciA9IEVycm9yPihcbiAgZm46ICgpID0+IFByb21pc2VMaWtlPHVua25vd24+LFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBFcnJvckNsYXNzOiBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBFLFxuICBtc2dJbmNsdWRlcz86IHN0cmluZyxcbiAgbXNnPzogc3RyaW5nLFxuKTogUHJvbWlzZTxFPjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3NlcnRSZWplY3RzPEUgZXh0ZW5kcyBFcnJvciA9IEVycm9yPihcbiAgZm46ICgpID0+IFByb21pc2VMaWtlPHVua25vd24+LFxuICBlcnJvckNsYXNzT3JNc2c/OlxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgfCAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSlcbiAgICB8IHN0cmluZyxcbiAgbXNnSW5jbHVkZXNPck1zZz86IHN0cmluZyxcbiAgbXNnPzogc3RyaW5nLFxuKTogUHJvbWlzZTxFIHwgRXJyb3IgfCB1bmtub3duPiB7XG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGxldCBFcnJvckNsYXNzOiAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gRSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBtc2dJbmNsdWRlczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgZXJyO1xuXG4gIGlmICh0eXBlb2YgZXJyb3JDbGFzc09yTXNnICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKFxuICAgICAgZXJyb3JDbGFzc09yTXNnID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGVycm9yQ2xhc3NPck1zZy5wcm90b3R5cGUgaW5zdGFuY2VvZiBFcnJvciB8fFxuICAgICAgZXJyb3JDbGFzc09yTXNnLnByb3RvdHlwZSA9PT0gRXJyb3IucHJvdG90eXBlXG4gICAgKSB7XG4gICAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgICAgRXJyb3JDbGFzcyA9IGVycm9yQ2xhc3NPck1zZyBhcyBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBFO1xuICAgICAgbXNnSW5jbHVkZXMgPSBtc2dJbmNsdWRlc09yTXNnO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtc2cgPSBlcnJvckNsYXNzT3JNc2c7XG4gIH1cbiAgbGV0IGRvZXNUaHJvdyA9IGZhbHNlO1xuICBsZXQgaXNQcm9taXNlUmV0dXJuZWQgPSBmYWxzZTtcbiAgY29uc3QgbXNnU3VmZml4ID0gbXNnID8gYDogJHttc2d9YCA6IFwiLlwiO1xuICB0cnkge1xuICAgIGNvbnN0IHBvc3NpYmxlUHJvbWlzZSA9IGZuKCk7XG4gICAgaWYgKFxuICAgICAgcG9zc2libGVQcm9taXNlICYmXG4gICAgICB0eXBlb2YgcG9zc2libGVQcm9taXNlID09PSBcIm9iamVjdFwiICYmXG4gICAgICB0eXBlb2YgcG9zc2libGVQcm9taXNlLnRoZW4gPT09IFwiZnVuY3Rpb25cIlxuICAgICkge1xuICAgICAgaXNQcm9taXNlUmV0dXJuZWQgPSB0cnVlO1xuICAgICAgYXdhaXQgcG9zc2libGVQcm9taXNlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoIWlzUHJvbWlzZVJldHVybmVkKSB7XG4gICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoXG4gICAgICAgIGBGdW5jdGlvbiB0aHJvd3Mgd2hlbiBleHBlY3RlZCB0byByZWplY3Qke21zZ1N1ZmZpeH1gLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKEVycm9yQ2xhc3MpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yID09PSBmYWxzZSkge1xuICAgICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoYEEgbm9uLUVycm9yIG9iamVjdCB3YXMgcmVqZWN0ZWQke21zZ1N1ZmZpeH1gKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydElzRXJyb3IoXG4gICAgICAgIGVycm9yLFxuICAgICAgICBFcnJvckNsYXNzLFxuICAgICAgICBtc2dJbmNsdWRlcyxcbiAgICAgICAgbXNnLFxuICAgICAgKTtcbiAgICB9XG4gICAgZXJyID0gZXJyb3I7XG4gICAgZG9lc1Rocm93ID0gdHJ1ZTtcbiAgfVxuICBpZiAoIWRvZXNUaHJvdykge1xuICAgIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihcbiAgICAgIGBFeHBlY3RlZCBmdW5jdGlvbiB0byByZWplY3Qke21zZ1N1ZmZpeH1gLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGVycjtcbn1cblxuLyoqIFVzZSB0aGlzIHRvIHN0dWIgb3V0IG1ldGhvZHMgdGhhdCB3aWxsIHRocm93IHdoZW4gaW52b2tlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmltcGxlbWVudGVkKG1zZz86IHN0cmluZyk6IG5ldmVyIHtcbiAgY29uc3QgbXNnU3VmZml4ID0gbXNnID8gYDogJHttc2d9YCA6IFwiLlwiO1xuICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IoYFVuaW1wbGVtZW50ZWQke21zZ1N1ZmZpeH1gKTtcbn1cblxuLyoqIFVzZSB0aGlzIHRvIGFzc2VydCB1bnJlYWNoYWJsZSBjb2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVucmVhY2hhYmxlKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKFwidW5yZWFjaGFibGVcIik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFOzs7Ozs7OztDQVFDLEdBRUQsU0FBUyxHQUFHLEVBQUUsVUFBVSxRQUFRLG1CQUFtQjtBQUNuRCxTQUFTLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxRQUFRLGFBQWE7QUFDekQsU0FBUyxNQUFNLFFBQVEsZUFBZTtBQUV0QyxNQUFNLGtCQUFrQjtBQUV4QixPQUFPLE1BQU0sdUJBQXVCO0lBQ3pCLE9BQU8saUJBQWlCO0lBQ2pDLFlBQVksT0FBZSxDQUFFO1FBQzNCLEtBQUssQ0FBQztJQUNSO0FBQ0YsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQVUsRUFBcUI7SUFDeEQsT0FBTztRQUFDLE9BQU8sUUFBUTtRQUFFO0tBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFNLEtBQU07QUFDdEQ7QUFFQTs7OztDQUlDLEdBQ0QsT0FBTyxTQUFTLE1BQU0sQ0FBVSxFQUFFLENBQVUsRUFBVztJQUNyRCxNQUFNLE9BQU8sSUFBSTtJQUNqQixPQUFPLEFBQUMsU0FBUyxRQUFRLENBQVUsRUFBRSxDQUFVLEVBQVc7UUFDeEQs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