import { ArgumentError, HelpError } from "./error.ts";
import { leftPad } from "./fmt.ts";
import { closest } from "./distance.ts";
/**
 * A `Command` groups a set of arguments, which
 * can be parsed from a given command line.
 */ export class Command {
    description;
    _requiredPositional;
    _optionalPositional;
    _allNamed;
    _flags;
    _requiredNamed;
    _allFlags;
    /**
   * Create a new `Command`. The `description` is
   * displayed in the generated help messages.
   */ constructor(description){
        this.description = description;
        this._requiredPositional = [];
        this._optionalPositional = null;
        this._allNamed = [];
        this._flags = [];
        this._requiredNamed = new Set();
        this._allFlags = new Set();
    }
    _fmtOptions() {
        const pairs = [];
        for (const arg of this._allNamed){
            const flags = arg.flags.join(", ");
            const required = this._requiredNamed.has(arg.name) ? " (required)" : "";
            pairs.push([
                `${flags} <${arg.type.typeName}>${required}`,
                arg.description ?? ""
            ]);
        }
        for (const flag of this._flags){
            pairs.push([
                flag.flags.join(", "),
                flag.description ?? ""
            ]);
        }
        const maxLength = pairs.reduce((max, [first, _])=>Math.max(max, first.length), 0);
        return `OPTIONS:\n${pairs.map(([first, second])=>second.length ? `\t${leftPad(first, maxLength)}  ${second}` : `\t${first}`).join("\n")}`;
    }
    _fmtUsage(path) {
        const required = this._requiredPositional.map((arg)=>`<${arg.name}>`).join(" ");
        const optional = this._optionalPositional ? ` [${this._optionalPositional.name}]` : "";
        const flags = this._allNamed.length + this._flags.length > 0 ? " [OPTIONS]" : "";
        return `USAGE:\n\t${path.join(" ") + (path.length ? " " : "") + required + optional + flags}`;
    }
    _fmtMissingPositional(path, arg) {
        return `Missing argument <${arg.name}>\n\n${this._fmtUsage(path)}`;
    }
    _fmtMissingNamed(arg) {
        return `Missing argument ${arg.flags.join(", ")} <${arg.type.typeName}>`;
    }
    _fmtPositionalArgParseError(arg, error) {
        return `Invalid argument <${arg.name}>: ${error.message}`;
    }
    _fmtNamedArgParseError(arg, flag, error) {
        return `Invalid argument ${flag} <${arg.type.typeName}>: ${error.message}`;
    }
    _fmtUnknownFlag(arg) {
        const unknownFlag = `Unknown flag '${arg.replaceAll("'", "\\'")}'`;
        const closestFlag = closest(arg, this._allFlags);
        if (closestFlag) {
            return `${unknownFlag}\n\nHELP:\n\tDid you mean ${closestFlag}?`;
        } else {
            return unknownFlag;
        }
    }
    _normalizeFlags(flags) {
        return flags.filter((flag)=>flag.length).map((flag)=>{
            if (flag.startsWith("-")) {
                return flag;
            } else if (flag.length > 1) {
                return "--" + flag;
            } else {
                return "-" + flag;
            }
        });
    }
    _parseValue(arg, value, flag) {
        try {
            return arg.type.parse(value);
        } catch (error) {
            if (flag != null) {
                throw new ArgumentError(this._fmtNamedArgParseError(arg, flag, error));
            } else {
                throw new ArgumentError(this._fmtPositionalArgParseError(arg, error));
            }
        }
    }
    /**
   * Add a required argument and return the modified
   * `Command`.
   *
   * The parsed argument will be present at key `name`
   * in the object returned from `parse` or `run`.
   *
   * # Example
   * ```javascript
   * const cmd = new Command()
   *   .required(string, "name", { flags: ["n", "name"], description: "The name." });
   * ```
   */ required(type, name, options) {
        if (!options?.flags?.length) {
            // positional argument
            if (this._optionalPositional != null) {
                throw new Error("required positional arguments must come before optional ones");
            }
            this._requiredPositional.push({
                name,
                description: options?.description,
                type
            });
        } else {
            // named argument
            const flags = this._normalizeFlags(options.flags);
            flags.forEach((flag)=>this._allFlags.add(flag));
            this._allNamed.push({
                name,
                description: options?.description,
                type,
                flags
            });
            this._requiredNamed.add(name);
        }
        // deno-lint-ignore no-explicit-any
        return this;
    }
    /**
   * Add an optional argument and return the modified
   * `Command`.
   *
   * If the optional argument was passed, it will be present
   * at key `name` in the object returned from `parse` or `run`.
   * Otherwise, the object will not contain the key `name`.
   *
   * # Example
   * ```javascript
   * const cmd = new Command()
   *   .optional(string, "name", { flags: ["n", "name"], description: "The name." });
   * ```
   */ optional(type, name, options) {
        if (!options?.flags?.length) {
            // positional argument
            if (this._optionalPositional != null) {
                throw new Error("there can be at most one optional positional argument");
            }
            this._optionalPositional = {
                name,
                description: options?.description,
                type
            };
        } else {
            // named argument
            const flags = this._normalizeFlags(options.flags);
            flags.forEach((flag)=>this._allFlags.add(flag));
            this._allNamed.push({
                name,
                description: options?.description,
                type,
                flags
            });
        }
        // deno-lint-ignore no-explicit-any
        return this;
    }
    /**
   * Add a `boolean` flag and return the modified
   * `Command`.
   *
   * # Example
   * ```javascript
   * const cmd = new Command()
   *   .flag("flag", { aliases: ["f", "the-flag"], description: "The flag." });
   * ```
   */ flag(name, options) {
        let flags = [
            name
        ];
        flags = this._normalizeFlags(options?.aliases ? flags.concat(options.aliases) : flags);
        flags.forEach((flag)=>this._allFlags.add(flag));
        this._flags.push({
            name,
            description: options?.description,
            flags
        });
        // deno-lint-ignore no-explicit-any
        return this;
    }
    /**
   * Return the generated help message.
   */ help(path = []) {
        const sections = [
            this.description,
            this._fmtUsage(path)
        ];
        if (this._allNamed.length + this._flags.length) {
            sections.push(this._fmtOptions());
        }
        return sections.join("\n\n").trim();
    }
    /**
   * Parse `args`, starting from `skip`. If the
   * argument list does not match the `Command`,
   * this throws an error.
   */ parse(args, skip = 0) {
        const isHelp = args.some((arg, idx)=>{
            if (idx < skip) return false;
            const argClean = arg.trim().toLowerCase();
            return argClean === "-h" || argClean === "--help";
        });
        if (isHelp) {
            throw new HelpError(this.help(args.slice(0, skip)));
        } else {
            const result = {};
            // required positional arguments
            const endOfRequired = skip + this._requiredPositional.length;
            for(let i = skip; i < endOfRequired; i++){
                const arg = this._requiredPositional[i - skip];
                if (i >= args.length) {
                    throw new ArgumentError(this._fmtMissingPositional(args.slice(0, skip), arg));
                } else {
                    result[arg.name] = this._parseValue(arg, args[i]);
                }
            }
            // optional positional argument
            let flagsStart = endOfRequired;
            if (this._optionalPositional && args.length > endOfRequired && !this._allFlags.has(args[endOfRequired])) {
                result[this._optionalPositional.name] = this._parseValue(this._optionalPositional, args[endOfRequired]);
                flagsStart += 1;
            }
            // flags and named arguments
            outerLoop: for(let i1 = flagsStart; i1 < args.length; i1++){
                if (!this._allFlags.has(args[i1])) {
                    throw new ArgumentError(this._fmtUnknownFlag(args[i1]));
                }
                for (const namedArg of this._allNamed){
                    if (namedArg.flags.includes(args[i1])) {
                        if (i1 + 1 < args.length) {
                            result[namedArg.name] = this._parseValue(namedArg, args[i1 + 1], args[i1]);
                            i1 += 1;
                            continue outerLoop;
                        } else {
                            throw new ArgumentError(this._fmtMissingNamed(namedArg));
                        }
                    }
                }
                for (const flag of this._flags){
                    if (flag.flags.includes(args[i1])) {
                        result[flag.name] = true;
                        continue outerLoop;
                    }
                }
            }
            // check for missing arguments
            for (const name of this._requiredNamed){
                if (!Object.hasOwn(result, name)) {
                    const arg1 = this._allNamed.find((arg)=>arg.name === name);
                    throw new ArgumentError(this._fmtMissingNamed(arg1));
                }
            }
            // fill optional arguments flags
            if (this._optionalPositional && !Object.hasOwn(result, this._optionalPositional.name)) {
                result[this._optionalPositional.name] = null;
            }
            for (const flag1 of this._flags){
                if (!Object.hasOwn(result, flag1.name)) result[flag1.name] = false;
            }
            for (const arg2 of this._allNamed){
                if (!Object.hasOwn(result, arg2.name)) result[arg2.name] = null;
            }
            return result;
        }
    }
    /**
   * Parse the arguments from `Deno.args`.
   *
   * This will print errors to `Deno.stderr`.
   * If a `-h` or `--help` flag is provided,
   * a help message is printed to `Deno.stdout`.
   * This also exits the process with the appropriate
   * return codes.
   *
   * # Example
   * Typically, you would call this at the start
   * of your program:
   * ```javascript
   * // obtain cmd ...
   * const options = cmd.run();
   * // use options ...
   * ```
   */ run() {
        try {
            return this.parse(Deno.args);
        } catch (error) {
            if (error instanceof ArgumentError) {
                const errorBytes = new TextEncoder().encode(error.message + "\n");
                Deno.stderr.writeSync(errorBytes);
                Deno.exit(1);
            } else if (error instanceof HelpError) {
                const errorBytes1 = new TextEncoder().encode(error.message + "\n");
                Deno.stdout.writeSync(errorBytes1);
                Deno.exit(0);
            } else {
                throw error;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2xheUB2MC4yLjUvc3JjL2NvbW1hbmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBcmd1bWVudFR5cGUgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgQXJndW1lbnRFcnJvciwgSGVscEVycm9yIH0gZnJvbSBcIi4vZXJyb3IudHNcIjtcbmltcG9ydCB7IGxlZnRQYWQgfSBmcm9tIFwiLi9mbXQudHNcIjtcbmltcG9ydCB7IGNsb3Nlc3QgfSBmcm9tIFwiLi9kaXN0YW5jZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJZiBgZmxhZ3NgIGlzIHNldCwgdGhlIGFyZ3VtZW50IGlzIHBhc3NlZFxuICAgKiBhcyBhIG5hbWVkIGZsYWcsIGUuZy4gYC0tbmFtZSB2YWx1ZWAuIE90aGVyd2lzZSxcbiAgICogdGhlIGFyZ3VtZW50IHdpbGwgYmUgYW4gYW5vbnltb3VzIHBvc2l0aW9uYWxcbiAgICogYXJndW1lbnQuXG4gICAqL1xuICByZWFkb25seSBmbGFnczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEEgZGVzY3JpcHRpb24gdG8gZGlzcGxheSBpbiB0aGUgZ2VuZXJhdGVkXG4gICAqIGhlbHAgbWVzc2FnZXMuXG4gICAqL1xuICByZWFkb25seSBkZXNjcmlwdGlvbj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGbGFnT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBIHNldCBvZiBhbGlhc2VzIGZvciB0aGUgZmxhZydzIGBuYW1lYC4gSWZcbiAgICogYW55IG9mIHRoZSBhbGlhc2VzLCBvciBgLS17bmFtZX1gIGFyZSBwYXNzZWQsXG4gICAqIHRoZSBmbGFnIGlzIHNldCB0byB0cnVlLlxuICAgKi9cbiAgcmVhZG9ubHkgYWxpYXNlcz86IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBBIGRlc2NyaXB0aW9uIHRvIGRpc3BsYXkgaW4gdGhlIGdlbmVyYXRlZFxuICAgKiBoZWxwIG1lc3NhZ2VzLlxuICAgKi9cbiAgcmVhZG9ubHkgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBBcmd1bWVudCB7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIHJlYWRvbmx5IHR5cGU6IEFyZ3VtZW50VHlwZTx1bmtub3duPjtcbn1cblxuaW50ZXJmYWNlIEZsYWdzIHtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgcmVhZG9ubHkgZmxhZ3M6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEEgYENvbW1hbmRgIGdyb3VwcyBhIHNldCBvZiBhcmd1bWVudHMsIHdoaWNoXG4gKiBjYW4gYmUgcGFyc2VkIGZyb20gYSBnaXZlbiBjb21tYW5kIGxpbmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21tYW5kPFQgPSBSZWNvcmQ8bmV2ZXIsIG5ldmVyPj4ge1xuICByZWFkb25seSBkZXNjcmlwdGlvbjogc3RyaW5nO1xuXG4gIHByaXZhdGUgX3JlcXVpcmVkUG9zaXRpb25hbDogQXJndW1lbnRbXTtcbiAgcHJpdmF0ZSBfb3B0aW9uYWxQb3NpdGlvbmFsOiBBcmd1bWVudCB8IG51bGw7XG4gIHByaXZhdGUgX2FsbE5hbWVkOiAoQXJndW1lbnQgJiBGbGFncylbXTtcbiAgcHJpdmF0ZSBfZmxhZ3M6IEZsYWdzW107XG5cbiAgcHJpdmF0ZSBfcmVxdWlyZWROYW1lZDogU2V0PHN0cmluZz47XG4gIHByaXZhdGUgX2FsbEZsYWdzOiBTZXQ8c3RyaW5nPjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBDb21tYW5kYC4gVGhlIGBkZXNjcmlwdGlvbmAgaXNcbiAgICogZGlzcGxheWVkIGluIHRoZSBnZW5lcmF0ZWQgaGVscCBtZXNzYWdlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG5cbiAgICB0aGlzLl9yZXF1aXJlZFBvc2l0aW9uYWwgPSBbXTtcbiAgICB0aGlzLl9vcHRpb25hbFBvc2l0aW9uYWwgPSBudWxsO1xuICAgIHRoaXMuX2FsbE5hbWVkID0gW107XG4gICAgdGhpcy5fZmxhZ3MgPSBbXTtcblxuICAgIHRoaXMuX3JlcXVpcmVkTmFtZWQgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fYWxsRmxhZ3MgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBwcml2YXRlIF9mbXRPcHRpb25zKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGFyZyBvZiB0aGlzLl9hbGxOYW1lZCkge1xuICAgICAgY29uc3QgZmxhZ3MgPSBhcmcuZmxhZ3Muam9pbihcIiwgXCIpO1xuICAgICAgY29uc3QgcmVxdWlyZWQgPSB0aGlzLl9yZXF1aXJlZE5hbWVkLmhhcyhhcmcubmFtZSkgPyBcIiAocmVxdWlyZWQpXCIgOiBcIlwiO1xuICAgICAgcGFpcnMucHVzaChbXG4gICAgICAgIGAke2ZsYWdzfSA8JHthcmcudHlwZS50eXBlTmFtZX0+JHtyZXF1aXJlZH1gLFxuICAgICAgICBhcmcuZGVzY3JpcHRpb24gPz8gXCJcIixcbiAgICAgIF0pO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGZsYWcgb2YgdGhpcy5fZmxhZ3MpIHtcbiAgICAgIHBhaXJzLnB1c2goW2ZsYWcuZmxhZ3Muam9pbihcIiwgXCIpLCBmbGFnLmRlc2NyaXB0aW9uID8/IFwiXCJdKTtcbiAgICB9XG4gICAgY29uc3QgbWF4TGVuZ3RoID0gcGFpcnMucmVkdWNlKFxuICAgICAgKG1heCwgW2ZpcnN0LCBfXSkgPT4gTWF0aC5tYXgobWF4LCBmaXJzdC5sZW5ndGgpLFxuICAgICAgMCxcbiAgICApO1xuICAgIHJldHVybiBgT1BUSU9OUzpcXG4ke1xuICAgICAgcGFpcnMubWFwKChbZmlyc3QsIHNlY29uZF0pID0+XG4gICAgICAgIHNlY29uZC5sZW5ndGhcbiAgICAgICAgICA/IGBcXHQke2xlZnRQYWQoZmlyc3QsIG1heExlbmd0aCl9ICAke3NlY29uZH1gXG4gICAgICAgICAgOiBgXFx0JHtmaXJzdH1gXG4gICAgICApXG4gICAgICAgIC5qb2luKFwiXFxuXCIpXG4gICAgfWA7XG4gIH1cblxuICBwcml2YXRlIF9mbXRVc2FnZShwYXRoOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVxdWlyZWQgPSB0aGlzLl9yZXF1aXJlZFBvc2l0aW9uYWxcbiAgICAgIC5tYXAoKGFyZykgPT4gYDwke2FyZy5uYW1lfT5gKVxuICAgICAgLmpvaW4oXCIgXCIpO1xuICAgIGNvbnN0IG9wdGlvbmFsID0gdGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsXG4gICAgICA/IGAgWyR7dGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsLm5hbWV9XWBcbiAgICAgIDogXCJcIjtcbiAgICBjb25zdCBmbGFncyA9IHRoaXMuX2FsbE5hbWVkLmxlbmd0aCArIHRoaXMuX2ZsYWdzLmxlbmd0aCA+IDBcbiAgICAgID8gXCIgW09QVElPTlNdXCJcbiAgICAgIDogXCJcIjtcbiAgICByZXR1cm4gYFVTQUdFOlxcblxcdCR7XG4gICAgICBwYXRoLmpvaW4oXCIgXCIpICsgKHBhdGgubGVuZ3RoID8gXCIgXCIgOiBcIlwiKSArIHJlcXVpcmVkICsgb3B0aW9uYWwgKyBmbGFnc1xuICAgIH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBfZm10TWlzc2luZ1Bvc2l0aW9uYWwocGF0aDogc3RyaW5nW10sIGFyZzogQXJndW1lbnQpOiBzdHJpbmcge1xuICAgIHJldHVybiBgTWlzc2luZyBhcmd1bWVudCA8JHthcmcubmFtZX0+XFxuXFxuJHt0aGlzLl9mbXRVc2FnZShwYXRoKX1gO1xuICB9XG5cbiAgcHJpdmF0ZSBfZm10TWlzc2luZ05hbWVkKGFyZzogQXJndW1lbnQgJiBGbGFncyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBNaXNzaW5nIGFyZ3VtZW50ICR7YXJnLmZsYWdzLmpvaW4oXCIsIFwiKX0gPCR7YXJnLnR5cGUudHlwZU5hbWV9PmA7XG4gIH1cblxuICBwcml2YXRlIF9mbXRQb3NpdGlvbmFsQXJnUGFyc2VFcnJvcihhcmc6IEFyZ3VtZW50LCBlcnJvcjogRXJyb3IpOiBzdHJpbmcge1xuICAgIHJldHVybiBgSW52YWxpZCBhcmd1bWVudCA8JHthcmcubmFtZX0+OiAke2Vycm9yLm1lc3NhZ2V9YDtcbiAgfVxuXG4gIHByaXZhdGUgX2ZtdE5hbWVkQXJnUGFyc2VFcnJvcihcbiAgICBhcmc6IEFyZ3VtZW50LFxuICAgIGZsYWc6IHN0cmluZyxcbiAgICBlcnJvcjogRXJyb3IsXG4gICk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBJbnZhbGlkIGFyZ3VtZW50ICR7ZmxhZ30gPCR7YXJnLnR5cGUudHlwZU5hbWV9PjogJHtlcnJvci5tZXNzYWdlfWA7XG4gIH1cblxuICBwcml2YXRlIF9mbXRVbmtub3duRmxhZyhhcmc6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdW5rbm93bkZsYWcgPSBgVW5rbm93biBmbGFnICcke2FyZy5yZXBsYWNlQWxsKFwiJ1wiLCBcIlxcXFwnXCIpfSdgO1xuICAgIGNvbnN0IGNsb3Nlc3RGbGFnID0gY2xvc2VzdChhcmcsIHRoaXMuX2FsbEZsYWdzKTtcbiAgICBpZiAoY2xvc2VzdEZsYWcpIHtcbiAgICAgIHJldHVybiBgJHt1bmtub3duRmxhZ31cXG5cXG5IRUxQOlxcblxcdERpZCB5b3UgbWVhbiAke2Nsb3Nlc3RGbGFnfT9gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5rbm93bkZsYWc7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbm9ybWFsaXplRmxhZ3MoZmxhZ3M6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBmbGFncy5maWx0ZXIoKGZsYWcpID0+IGZsYWcubGVuZ3RoKS5tYXAoKGZsYWcpID0+IHtcbiAgICAgIGlmIChmbGFnLnN0YXJ0c1dpdGgoXCItXCIpKSB7XG4gICAgICAgIHJldHVybiBmbGFnO1xuICAgICAgfSBlbHNlIGlmIChmbGFnLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIFwiLS1cIiArIGZsYWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCItXCIgKyBmbGFnO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VWYWx1ZShhcmc6IEFyZ3VtZW50LCB2YWx1ZTogc3RyaW5nLCBmbGFnPzogc3RyaW5nKTogdW5rbm93biB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhcmcudHlwZS5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChmbGFnICE9IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IodGhpcy5fZm10TmFtZWRBcmdQYXJzZUVycm9yKGFyZywgZmxhZywgZXJyb3IpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBBcmd1bWVudEVycm9yKHRoaXMuX2ZtdFBvc2l0aW9uYWxBcmdQYXJzZUVycm9yKGFyZywgZXJyb3IpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgcmVxdWlyZWQgYXJndW1lbnQgYW5kIHJldHVybiB0aGUgbW9kaWZpZWRcbiAgICogYENvbW1hbmRgLlxuICAgKlxuICAgKiBUaGUgcGFyc2VkIGFyZ3VtZW50IHdpbGwgYmUgcHJlc2VudCBhdCBrZXkgYG5hbWVgXG4gICAqIGluIHRoZSBvYmplY3QgcmV0dXJuZWQgZnJvbSBgcGFyc2VgIG9yIGBydW5gLlxuICAgKlxuICAgKiAjIEV4YW1wbGVcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBjb25zdCBjbWQgPSBuZXcgQ29tbWFuZCgpXG4gICAqICAgLnJlcXVpcmVkKHN0cmluZywgXCJuYW1lXCIsIHsgZmxhZ3M6IFtcIm5cIiwgXCJuYW1lXCJdLCBkZXNjcmlwdGlvbjogXCJUaGUgbmFtZS5cIiB9KTtcbiAgICogYGBgXG4gICAqL1xuICByZXF1aXJlZDxUeXBlLCBOYW1lIGV4dGVuZHMgc3RyaW5nPihcbiAgICB0eXBlOiBBcmd1bWVudFR5cGU8VHlwZT4sXG4gICAgbmFtZTogTmFtZSxcbiAgICBvcHRpb25zPzogQXJndW1lbnRPcHRpb25zLFxuICApOiBDb21tYW5kPFQgJiB7IFtuYW1lIGluIE5hbWVdOiBUeXBlIH0+IHtcbiAgICBpZiAoIW9wdGlvbnM/LmZsYWdzPy5sZW5ndGgpIHtcbiAgICAgIC8vIHBvc2l0aW9uYWwgYXJndW1lbnRcbiAgICAgIGlmICh0aGlzLl9vcHRpb25hbFBvc2l0aW9uYWwgIT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJyZXF1aXJlZCBwb3NpdGlvbmFsIGFyZ3VtZW50cyBtdXN0IGNvbWUgYmVmb3JlIG9wdGlvbmFsIG9uZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlcXVpcmVkUG9zaXRpb25hbC5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb246IG9wdGlvbnM/LmRlc2NyaXB0aW9uLFxuICAgICAgICB0eXBlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5hbWVkIGFyZ3VtZW50XG4gICAgICBjb25zdCBmbGFncyA9IHRoaXMuX25vcm1hbGl6ZUZsYWdzKG9wdGlvbnMuZmxhZ3MpO1xuICAgICAgZmxhZ3MuZm9yRWFjaCgoZmxhZykgPT4gdGhpcy5fYWxsRmxhZ3MuYWRkKGZsYWcpKTtcbiAgICAgIHRoaXMuX2FsbE5hbWVkLnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogb3B0aW9ucz8uZGVzY3JpcHRpb24sXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGZsYWdzLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZXF1aXJlZE5hbWVkLmFkZChuYW1lKTtcbiAgICB9XG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIG9wdGlvbmFsIGFyZ3VtZW50IGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkXG4gICAqIGBDb21tYW5kYC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIGFyZ3VtZW50IHdhcyBwYXNzZWQsIGl0IHdpbGwgYmUgcHJlc2VudFxuICAgKiBhdCBrZXkgYG5hbWVgIGluIHRoZSBvYmplY3QgcmV0dXJuZWQgZnJvbSBgcGFyc2VgIG9yIGBydW5gLlxuICAgKiBPdGhlcndpc2UsIHRoZSBvYmplY3Qgd2lsbCBub3QgY29udGFpbiB0aGUga2V5IGBuYW1lYC5cbiAgICpcbiAgICogIyBFeGFtcGxlXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogY29uc3QgY21kID0gbmV3IENvbW1hbmQoKVxuICAgKiAgIC5vcHRpb25hbChzdHJpbmcsIFwibmFtZVwiLCB7IGZsYWdzOiBbXCJuXCIsIFwibmFtZVwiXSwgZGVzY3JpcHRpb246IFwiVGhlIG5hbWUuXCIgfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgb3B0aW9uYWw8VHlwZSwgTmFtZSBleHRlbmRzIHN0cmluZz4oXG4gICAgdHlwZTogQXJndW1lbnRUeXBlPFR5cGU+LFxuICAgIG5hbWU6IE5hbWUsXG4gICAgb3B0aW9ucz86IEFyZ3VtZW50T3B0aW9ucyxcbiAgKTogQ29tbWFuZDxUICYgeyBbbmFtZSBpbiBOYW1lXTogVHlwZSB8IG51bGwgfT4ge1xuICAgIGlmICghb3B0aW9ucz8uZmxhZ3M/Lmxlbmd0aCkge1xuICAgICAgLy8gcG9zaXRpb25hbCBhcmd1bWVudFxuICAgICAgaWYgKHRoaXMuX29wdGlvbmFsUG9zaXRpb25hbCAhPSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcInRoZXJlIGNhbiBiZSBhdCBtb3N0IG9uZSBvcHRpb25hbCBwb3NpdGlvbmFsIGFyZ3VtZW50XCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLl9vcHRpb25hbFBvc2l0aW9uYWwgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zPy5kZXNjcmlwdGlvbixcbiAgICAgICAgdHlwZSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5hbWVkIGFyZ3VtZW50XG4gICAgICBjb25zdCBmbGFncyA9IHRoaXMuX25vcm1hbGl6ZUZsYWdzKG9wdGlvbnMuZmxhZ3MpO1xuICAgICAgZmxhZ3MuZm9yRWFjaCgoZmxhZykgPT4gdGhpcy5fYWxsRmxhZ3MuYWRkKGZsYWcpKTtcbiAgICAgIHRoaXMuX2FsbE5hbWVkLnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogb3B0aW9ucz8uZGVzY3JpcHRpb24sXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGZsYWdzLFxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGBib29sZWFuYCBmbGFnIGFuZCByZXR1cm4gdGhlIG1vZGlmaWVkXG4gICAqIGBDb21tYW5kYC5cbiAgICpcbiAgICogIyBFeGFtcGxlXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogY29uc3QgY21kID0gbmV3IENvbW1hbmQoKVxuICAgKiAgIC5mbGFnKFwiZmxhZ1wiLCB7IGFsaWFzZXM6IFtcImZcIiwgXCJ0aGUtZmxhZ1wiXSwgZGVzY3JpcHRpb246IFwiVGhlIGZsYWcuXCIgfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZmxhZzxOYW1lIGV4dGVuZHMgc3RyaW5nPihcbiAgICBuYW1lOiBOYW1lLFxuICAgIG9wdGlvbnM/OiBGbGFnT3B0aW9ucyxcbiAgKTogQ29tbWFuZDxUICYgeyBbbmFtZSBpbiBOYW1lXTogYm9vbGVhbiB9PiB7XG4gICAgbGV0IGZsYWdzOiBzdHJpbmdbXSA9IFtuYW1lXTtcbiAgICBmbGFncyA9IHRoaXMuX25vcm1hbGl6ZUZsYWdzKFxuICAgICAgb3B0aW9ucz8uYWxpYXNlcyA/IGZsYWdzLmNvbmNhdChvcHRpb25zLmFsaWFzZXMpIDogZmxhZ3MsXG4gICAgKTtcbiAgICBmbGFncy5mb3JFYWNoKChmbGFnKSA9PiB0aGlzLl9hbGxGbGFncy5hZGQoZmxhZykpO1xuICAgIHRoaXMuX2ZsYWdzLnB1c2goe1xuICAgICAgbmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zPy5kZXNjcmlwdGlvbixcbiAgICAgIGZsYWdzLFxuICAgIH0pO1xuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgcmV0dXJuIHRoaXMgYXMgYW55O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZ2VuZXJhdGVkIGhlbHAgbWVzc2FnZS5cbiAgICovXG4gIGhlbHAocGF0aDogc3RyaW5nW10gPSBbXSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXG4gICAgICB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgdGhpcy5fZm10VXNhZ2UocGF0aCksXG4gICAgXTtcbiAgICBpZiAodGhpcy5fYWxsTmFtZWQubGVuZ3RoICsgdGhpcy5fZmxhZ3MubGVuZ3RoKSB7XG4gICAgICBzZWN0aW9ucy5wdXNoKHRoaXMuX2ZtdE9wdGlvbnMoKSk7XG4gICAgfVxuICAgIHJldHVybiBzZWN0aW9ucy5qb2luKFwiXFxuXFxuXCIpLnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBgYXJnc2AsIHN0YXJ0aW5nIGZyb20gYHNraXBgLiBJZiB0aGVcbiAgICogYXJndW1lbnQgbGlzdCBkb2VzIG5vdCBtYXRjaCB0aGUgYENvbW1hbmRgLFxuICAgKiB0aGlzIHRocm93cyBhbiBlcnJvci5cbiAgICovXG4gIHBhcnNlKGFyZ3M6IHN0cmluZ1tdLCBza2lwID0gMCk6IFQge1xuICAgIGNvbnN0IGlzSGVscCA9IGFyZ3Muc29tZSgoYXJnLCBpZHgpID0+IHtcbiAgICAgIGlmIChpZHggPCBza2lwKSByZXR1cm4gZmFsc2U7XG4gICAgICBjb25zdCBhcmdDbGVhbiA9IGFyZy50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHJldHVybiBhcmdDbGVhbiA9PT0gXCItaFwiIHx8IGFyZ0NsZWFuID09PSBcIi0taGVscFwiO1xuICAgIH0pO1xuICAgIGlmIChpc0hlbHApIHtcbiAgICAgIHRocm93IG5ldyBIZWxwRXJyb3IodGhpcy5oZWxwKGFyZ3Muc2xpY2UoMCwgc2tpcCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXG4gICAgICAvLyByZXF1aXJlZCBwb3NpdGlvbmFsIGFyZ3VtZW50c1xuICAgICAgY29uc3QgZW5kT2ZSZXF1aXJlZCA9IHNraXAgKyB0aGlzLl9yZXF1aXJlZFBvc2l0aW9uYWwubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaSA9IHNraXA7IGkgPCBlbmRPZlJlcXVpcmVkOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXJnID0gdGhpcy5fcmVxdWlyZWRQb3NpdGlvbmFsW2kgLSBza2lwXTtcbiAgICAgICAgaWYgKGkgPj0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFcnJvcihcbiAgICAgICAgICAgIHRoaXMuX2ZtdE1pc3NpbmdQb3NpdGlvbmFsKGFyZ3Muc2xpY2UoMCwgc2tpcCksIGFyZyksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRbYXJnLm5hbWVdID0gdGhpcy5fcGFyc2VWYWx1ZShhcmcsIGFyZ3NbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG9wdGlvbmFsIHBvc2l0aW9uYWwgYXJndW1lbnRcbiAgICAgIGxldCBmbGFnc1N0YXJ0ID0gZW5kT2ZSZXF1aXJlZDtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsICYmXG4gICAgICAgIGFyZ3MubGVuZ3RoID4gZW5kT2ZSZXF1aXJlZCAmJlxuICAgICAgICAhdGhpcy5fYWxsRmxhZ3MuaGFzKGFyZ3NbZW5kT2ZSZXF1aXJlZF0pXG4gICAgICApIHtcbiAgICAgICAgcmVzdWx0W3RoaXMuX29wdGlvbmFsUG9zaXRpb25hbC5uYW1lXSA9IHRoaXMuX3BhcnNlVmFsdWUoXG4gICAgICAgICAgdGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsLFxuICAgICAgICAgIGFyZ3NbZW5kT2ZSZXF1aXJlZF0sXG4gICAgICAgICk7XG4gICAgICAgIGZsYWdzU3RhcnQgKz0gMTtcbiAgICAgIH1cblxuICAgICAgLy8gZmxhZ3MgYW5kIG5hbWVkIGFyZ3VtZW50c1xuICAgICAgb3V0ZXJMb29wOlxuICAgICAgZm9yIChsZXQgaSA9IGZsYWdzU3RhcnQ7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5fYWxsRmxhZ3MuaGFzKGFyZ3NbaV0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoXG4gICAgICAgICAgICB0aGlzLl9mbXRVbmtub3duRmxhZyhhcmdzW2ldKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbmFtZWRBcmcgb2YgdGhpcy5fYWxsTmFtZWQpIHtcbiAgICAgICAgICBpZiAobmFtZWRBcmcuZmxhZ3MuaW5jbHVkZXMoYXJnc1tpXSkpIHtcbiAgICAgICAgICAgIGlmIChpICsgMSA8IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3VsdFtuYW1lZEFyZy5uYW1lXSA9IHRoaXMuX3BhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgbmFtZWRBcmcsXG4gICAgICAgICAgICAgICAgYXJnc1tpICsgMV0sXG4gICAgICAgICAgICAgICAgYXJnc1tpXSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICBjb250aW51ZSBvdXRlckxvb3A7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFcnJvcih0aGlzLl9mbXRNaXNzaW5nTmFtZWQobmFtZWRBcmcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBmbGFnIG9mIHRoaXMuX2ZsYWdzKSB7XG4gICAgICAgICAgaWYgKGZsYWcuZmxhZ3MuaW5jbHVkZXMoYXJnc1tpXSkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtmbGFnLm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnRpbnVlIG91dGVyTG9vcDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgZm9yIG1pc3NpbmcgYXJndW1lbnRzXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5fcmVxdWlyZWROYW1lZCkge1xuICAgICAgICBpZiAoIU9iamVjdC5oYXNPd24ocmVzdWx0LCBuYW1lKSkge1xuICAgICAgICAgIGNvbnN0IGFyZyA9IHRoaXMuX2FsbE5hbWVkLmZpbmQoKGFyZykgPT4gYXJnLm5hbWUgPT09IG5hbWUpO1xuICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudEVycm9yKHRoaXMuX2ZtdE1pc3NpbmdOYW1lZChhcmchKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZmlsbCBvcHRpb25hbCBhcmd1bWVudHMgZmxhZ3NcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsICYmXG4gICAgICAgICFPYmplY3QuaGFzT3duKHJlc3VsdCwgdGhpcy5fb3B0aW9uYWxQb3NpdGlvbmFsLm5hbWUpXG4gICAgICApIHtcbiAgICAgICAgcmVzdWx0W3RoaXMuX29wdGlvbmFsUG9zaXRpb25hbC5uYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGZsYWcgb2YgdGhpcy5fZmxhZ3MpIHtcbiAgICAgICAgaWYgKCFPYmplY3QuaGFzT3duKHJlc3VsdCwgZmxhZy5uYW1lKSkgcmVzdWx0W2ZsYWcubmFtZV0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgYXJnIG9mIHRoaXMuX2FsbE5hbWVkKSB7XG4gICAgICAgIGlmICghT2JqZWN0Lmhhc093bihyZXN1bHQsIGFyZy5uYW1lKSkgcmVzdWx0W2FyZy5uYW1lXSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQgYXMgVDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIGFyZ3VtZW50cyBmcm9tIGBEZW5vLmFyZ3NgLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgcHJpbnQgZXJyb3JzIHRvIGBEZW5vLnN0ZGVycmAuXG4gICAqIElmIGEgYC1oYCBvciBgLS1oZWxwYCBmbGFnIGlzIHByb3ZpZGVkLFxuICAgKiBhIGhlbHAgbWVzc2FnZSBpcyBwcmludGVkIHRvIGBEZW5vLnN0ZG91dGAuXG4gICAqIFRoaXMgYWxzbyBleGl0cyB0aGUgcHJvY2VzcyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxuICAgKiByZXR1cm4gY29kZXMuXG4gICAqXG4gICAqICMgRXhhbXBsZVxuICAgKiBUeXBpY2FsbHksIHlvdSB3b3VsZCBjYWxsIHRoaXMgYXQgdGhlIHN0YXJ0XG4gICAqIG9mIHlvdXIgcHJvZ3JhbTpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiAvLyBvYnRhaW4gY21kIC4uLlxuICAgKiBjb25zdCBvcHRpb25zID0gY21kLnJ1bigpO1xuICAgKiAvLyB1c2Ugb3B0aW9ucyAuLi5cbiAgICogYGBgXG4gICAqL1xuICBydW4oKTogVCB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlKERlbm8uYXJncyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEFyZ3VtZW50RXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShlcnJvci5tZXNzYWdlICsgXCJcXG5cIik7XG4gICAgICAgIERlbm8uc3RkZXJyLndyaXRlU3luYyhlcnJvckJ5dGVzKTtcbiAgICAgICAgRGVuby5leGl0KDEpO1xuICAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIEhlbHBFcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvckJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGVycm9yLm1lc3NhZ2UgKyBcIlxcblwiKTtcbiAgICAgICAgRGVuby5zdGRvdXQud3JpdGVTeW5jKGVycm9yQnl0ZXMpO1xuICAgICAgICBEZW5vLmV4aXQoMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLGFBQWEsRUFBRSxTQUFTLFFBQVEsYUFBYTtBQUN0RCxTQUFTLE9BQU8sUUFBUSxXQUFXO0FBQ25DLFNBQVMsT0FBTyxRQUFRLGdCQUFnQjtBQTZDeEM7OztDQUdDLEdBQ0QsT0FBTyxNQUFNO0lBQ0YsWUFBb0I7SUFFckIsb0JBQWdDO0lBQ2hDLG9CQUFxQztJQUNyQyxVQUFnQztJQUNoQyxPQUFnQjtJQUVoQixlQUE0QjtJQUM1QixVQUF1QjtJQUUvQjs7O0dBR0MsR0FDRCxZQUFZLFdBQW1CLENBQUU7UUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRztRQUVuQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRTtRQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSTtRQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUU7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFO1FBRWhCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSTtRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDdkI7SUFFUSxjQUFzQjtRQUM1QixNQUFNLFFBQVEs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