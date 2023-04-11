import { ArgumentError, HelpError } from "./error.ts";
import { leftPad } from "./fmt.ts";
import { closest } from "./distance.ts";
/**
 * A group of `Command`s.
 */ export class CommandGroup {
    description;
    _commands;
    /**
   * Create a new `CommandGroup`. The `description`
   * is displayed in the generated help messages.
   */ constructor(description){
        this.description = description;
        this._commands = {};
    }
    _fmtUsage(path) {
        return `USAGE:\n\t${path.join(" ")}${path.length ? " " : ""}<command>`;
    }
    _fmtCommands() {
        const pairs = Object.entries(this._commands);
        const maxLength = pairs.reduce((max, [name, _])=>Math.max(max, name.length), 0);
        return `COMMANDS:\n${pairs.map(([name, command])=>`\t${leftPad(name, maxLength)}  ${command.description}`).join("\n")}`;
    }
    _fmtUnknownCommand(arg) {
        const unknownCommand = `Unknown command '${arg.replaceAll("'", "\\'")}'`;
        const closestCommand = closest(arg, Object.getOwnPropertyNames(this._commands));
        if (closestCommand) {
            return `${unknownCommand}\n\nHELP:\n\tDid you mean ${closestCommand}?`;
        } else {
            return unknownCommand;
        }
    }
    /**
   * Add a sub command, which can either be a `Command`,
   * or another `CommandGroup`.
   *
   * If the sub command is selected, it's parsed result
   * will be present at key `name` in the object returned
   * from `parse` or `run`. Otherwise, the object will not
   * contain the key `name`.
   */ subcommand(name, command) {
        this._commands[name] = command;
        // deno-lint-ignore no-explicit-any
        return this;
    }
    /**
   * Return the generated help message.
   */ help(path = []) {
        return [
            this.description,
            this._fmtUsage(path),
            this._fmtCommands()
        ].join("\n\n").trim();
    }
    /**
   * Parse `args`, starting from `skip`. If the
   * argument list does not match the `CommandGroup`,
   * this throws an error.
   */ parse(args, skip = 0) {
        if (skip >= args.length) {
            throw new ArgumentError(this.help(args.slice(0, skip)));
        } else if (args[skip] in this._commands) {
            return {
                [args[skip]]: this._commands[args[skip]].parse(args, skip + 1)
            };
        } else {
            const isHelp = args.some((arg, idx)=>{
                if (idx < skip) return false;
                const argClean = arg.trim().toLowerCase();
                return argClean === "-h" || argClean === "--help";
            });
            if (isHelp) {
                throw new HelpError(this.help(args.slice(0, skip)));
            } else {
                throw new ArgumentError(this._fmtUnknownCommand(args[skip]));
            }
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
   * // obtain group ...
   * const options = group.run();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2xheUB2MC4yLjUvc3JjL2dyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29tbWFuZCB9IGZyb20gXCIuL2NvbW1hbmQudHNcIjtcbmltcG9ydCB7IEFyZ3VtZW50RXJyb3IsIEhlbHBFcnJvciB9IGZyb20gXCIuL2Vycm9yLnRzXCI7XG5pbXBvcnQgeyBsZWZ0UGFkIH0gZnJvbSBcIi4vZm10LnRzXCI7XG5pbXBvcnQgeyBjbG9zZXN0IH0gZnJvbSBcIi4vZGlzdGFuY2UudHNcIjtcblxuLyoqXG4gKiBBIGdyb3VwIG9mIGBDb21tYW5kYHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21tYW5kR3JvdXA8VCA9IFJlY29yZDxuZXZlciwgbmV2ZXI+PiB7XG4gIHJlYWRvbmx5IGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfY29tbWFuZHM6IFJlY29yZDxzdHJpbmcsIENvbW1hbmQ8dW5rbm93bj4gfCBDb21tYW5kR3JvdXA8dW5rbm93bj4+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYENvbW1hbmRHcm91cGAuIFRoZSBgZGVzY3JpcHRpb25gXG4gICAqIGlzIGRpc3BsYXllZCBpbiB0aGUgZ2VuZXJhdGVkIGhlbHAgbWVzc2FnZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuX2NvbW1hbmRzID0ge307XG4gIH1cblxuICBwcml2YXRlIF9mbXRVc2FnZShwYXRoOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBVU0FHRTpcXG5cXHQke3BhdGguam9pbihcIiBcIil9JHtwYXRoLmxlbmd0aCA/IFwiIFwiIDogXCJcIn08Y29tbWFuZD5gO1xuICB9XG5cbiAgcHJpdmF0ZSBfZm10Q29tbWFuZHMoKSB7XG4gICAgY29uc3QgcGFpcnMgPSBPYmplY3QuZW50cmllcyh0aGlzLl9jb21tYW5kcyk7XG4gICAgY29uc3QgbWF4TGVuZ3RoID0gcGFpcnMucmVkdWNlKFxuICAgICAgKG1heCwgW25hbWUsIF9dKSA9PiBNYXRoLm1heChtYXgsIG5hbWUubGVuZ3RoKSxcbiAgICAgIDAsXG4gICAgKTtcbiAgICByZXR1cm4gYENPTU1BTkRTOlxcbiR7XG4gICAgICBwYWlycy5tYXAoKFtuYW1lLCBjb21tYW5kXSkgPT5cbiAgICAgICAgYFxcdCR7bGVmdFBhZChuYW1lLCBtYXhMZW5ndGgpfSAgJHtjb21tYW5kLmRlc2NyaXB0aW9ufWBcbiAgICAgICkuam9pbihcIlxcblwiKVxuICAgIH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBfZm10VW5rbm93bkNvbW1hbmQoYXJnOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVua25vd25Db21tYW5kID0gYFVua25vd24gY29tbWFuZCAnJHthcmcucmVwbGFjZUFsbChcIidcIiwgXCJcXFxcJ1wiKX0nYDtcbiAgICBjb25zdCBjbG9zZXN0Q29tbWFuZCA9IGNsb3Nlc3QoXG4gICAgICBhcmcsXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLl9jb21tYW5kcyksXG4gICAgKTtcbiAgICBpZiAoY2xvc2VzdENvbW1hbmQpIHtcbiAgICAgIHJldHVybiBgJHt1bmtub3duQ29tbWFuZH1cXG5cXG5IRUxQOlxcblxcdERpZCB5b3UgbWVhbiAke2Nsb3Nlc3RDb21tYW5kfT9gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5rbm93bkNvbW1hbmQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHN1YiBjb21tYW5kLCB3aGljaCBjYW4gZWl0aGVyIGJlIGEgYENvbW1hbmRgLFxuICAgKiBvciBhbm90aGVyIGBDb21tYW5kR3JvdXBgLlxuICAgKlxuICAgKiBJZiB0aGUgc3ViIGNvbW1hbmQgaXMgc2VsZWN0ZWQsIGl0J3MgcGFyc2VkIHJlc3VsdFxuICAgKiB3aWxsIGJlIHByZXNlbnQgYXQga2V5IGBuYW1lYCBpbiB0aGUgb2JqZWN0IHJldHVybmVkXG4gICAqIGZyb20gYHBhcnNlYCBvciBgcnVuYC4gT3RoZXJ3aXNlLCB0aGUgb2JqZWN0IHdpbGwgbm90XG4gICAqIGNvbnRhaW4gdGhlIGtleSBgbmFtZWAuXG4gICAqL1xuICBzdWJjb21tYW5kPFR5cGUsIE5hbWUgZXh0ZW5kcyBzdHJpbmc+KFxuICAgIG5hbWU6IE5hbWUsXG4gICAgY29tbWFuZDogQ29tbWFuZDxUeXBlPiB8IENvbW1hbmRHcm91cDxUeXBlPixcbiAgKTogQ29tbWFuZEdyb3VwPFQgJiB7IFtuYW1lIGluIE5hbWVdPzogVHlwZSB9PiB7XG4gICAgdGhpcy5fY29tbWFuZHNbbmFtZV0gPSBjb21tYW5kIGFzIENvbW1hbmQ8dW5rbm93bj47XG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICByZXR1cm4gdGhpcyBhcyBhbnk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBnZW5lcmF0ZWQgaGVscCBtZXNzYWdlLlxuICAgKi9cbiAgaGVscChwYXRoOiBzdHJpbmdbXSA9IFtdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIHRoaXMuX2ZtdFVzYWdlKHBhdGgpLFxuICAgICAgdGhpcy5fZm10Q29tbWFuZHMoKSxcbiAgICBdLmpvaW4oXCJcXG5cXG5cIikudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGBhcmdzYCwgc3RhcnRpbmcgZnJvbSBgc2tpcGAuIElmIHRoZVxuICAgKiBhcmd1bWVudCBsaXN0IGRvZXMgbm90IG1hdGNoIHRoZSBgQ29tbWFuZEdyb3VwYCxcbiAgICogdGhpcyB0aHJvd3MgYW4gZXJyb3IuXG4gICAqL1xuICBwYXJzZShhcmdzOiBzdHJpbmdbXSwgc2tpcCA9IDApOiBUIHtcbiAgICBpZiAoc2tpcCA+PSBhcmdzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IodGhpcy5oZWxwKGFyZ3Muc2xpY2UoMCwgc2tpcCkpKTtcbiAgICB9IGVsc2UgaWYgKGFyZ3Nbc2tpcF0gaW4gdGhpcy5fY29tbWFuZHMpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIFthcmdzW3NraXBdXTogdGhpcy5fY29tbWFuZHNbYXJnc1tza2lwXV0ucGFyc2UoYXJncywgc2tpcCArIDEpLFxuICAgICAgfSBhcyB1bmtub3duIGFzIFQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzSGVscCA9IGFyZ3Muc29tZSgoYXJnLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKGlkeCA8IHNraXApIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgYXJnQ2xlYW4gPSBhcmcudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBhcmdDbGVhbiA9PT0gXCItaFwiIHx8IGFyZ0NsZWFuID09PSBcIi0taGVscFwiO1xuICAgICAgfSk7XG4gICAgICBpZiAoaXNIZWxwKSB7XG4gICAgICAgIHRocm93IG5ldyBIZWxwRXJyb3IodGhpcy5oZWxwKGFyZ3Muc2xpY2UoMCwgc2tpcCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBBcmd1bWVudEVycm9yKHRoaXMuX2ZtdFVua25vd25Db21tYW5kKGFyZ3Nbc2tpcF0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIGFyZ3VtZW50cyBmcm9tIGBEZW5vLmFyZ3NgLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgcHJpbnQgZXJyb3JzIHRvIGBEZW5vLnN0ZGVycmAuXG4gICAqIElmIGEgYC1oYCBvciBgLS1oZWxwYCBmbGFnIGlzIHByb3ZpZGVkLFxuICAgKiBhIGhlbHAgbWVzc2FnZSBpcyBwcmludGVkIHRvIGBEZW5vLnN0ZG91dGAuXG4gICAqIFRoaXMgYWxzbyBleGl0cyB0aGUgcHJvY2VzcyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxuICAgKiByZXR1cm4gY29kZXMuXG4gICAqXG4gICAqICMgRXhhbXBsZVxuICAgKiBUeXBpY2FsbHksIHlvdSB3b3VsZCBjYWxsIHRoaXMgYXQgdGhlIHN0YXJ0XG4gICAqIG9mIHlvdXIgcHJvZ3JhbTpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiAvLyBvYnRhaW4gZ3JvdXAgLi4uXG4gICAqIGNvbnN0IG9wdGlvbnMgPSBncm91cC5ydW4oKTtcbiAgICogLy8gdXNlIG9wdGlvbnMgLi4uXG4gICAqIGBgYFxuICAgKi9cbiAgcnVuKCk6IFQge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZShEZW5vLmFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBBcmd1bWVudEVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yQnl0ZXMgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZXJyb3IubWVzc2FnZSArIFwiXFxuXCIpO1xuICAgICAgICBEZW5vLnN0ZGVyci53cml0ZVN5bmMoZXJyb3JCeXRlcyk7XG4gICAgICAgIERlbm8uZXhpdCgxKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBIZWxwRXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShlcnJvci5tZXNzYWdlICsgXCJcXG5cIik7XG4gICAgICAgIERlbm8uc3Rkb3V0LndyaXRlU3luYyhlcnJvckJ5dGVzKTtcbiAgICAgICAgRGVuby5leGl0KDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxhQUFhLEVBQUUsU0FBUyxRQUFRLGFBQWE7QUFDdEQsU0FBUyxPQUFPLFFBQVEsV0FBVztBQUNuQyxTQUFTLE9BQU8sUUFBUSxnQkFBZ0I7QUFFeEM7O0NBRUMsR0FDRCxPQUFPLE1BQU07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