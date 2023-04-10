/*!
 * Copyright (c) 2020 Johnny "Le Chi Dung"
 * MIT Licensed
 */ const matchEscHtmlRx = /["'&<>]/;
const matchUnEscRx = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
// deno-lint-ignore no-control-regex
const matchEscSqlRx = /[\0\b\t\n\r\x1a"'\\]/g;
export function isEscape(str) {
    const removeUnEscStr = str.replace(matchUnEscRx, "");
    const matchEscHtml = matchEscHtmlRx.exec(removeUnEscStr);
    if (!matchEscHtml) {
        return false;
    }
    return true;
}
export function escapeHtml(str) {
    const matchEscHtml = matchEscHtmlRx.exec(str);
    if (!matchEscHtml) {
        return str;
    }
    let escape;
    let html = "";
    let index = 0;
    let lastIndex = 0;
    for(index = matchEscHtml.index; index < str.length; index++){
        switch(str.charCodeAt(index)){
            case 34:
                escape = "&quot;";
                break;
            case 38:
                escape = "&amp;";
                break;
            case 39:
                escape = "&#39;";
                break;
            case 60:
                escape = "&lt;";
                break;
            case 62:
                escape = "&gt;";
                break;
            default:
                continue;
        }
        if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escape;
    }
    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}
export function isUnescape(str) {
    const matchUnEsc = matchUnEscRx.exec(str);
    if (!matchUnEsc) {
        return false;
    }
    return true;
}
export function unescapeHtml(str) {
    const matchUnEsc = matchUnEscRx.exec(str);
    if (!matchUnEsc) {
        return str;
    }
    const res = str.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x3A;/g, ":").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    return unescapeHtml(res);
}
export function escapeSql(sqlStr) {
    const match = matchEscSqlRx.exec(sqlStr);
    if (!match) {
        return sqlStr;
    }
    let chunkIndex = matchEscSqlRx.lastIndex = 0;
    let escapedSqlStr = "";
    let matchChar;
    let escape;
    while(matchChar = matchEscSqlRx.exec(sqlStr)){
        switch(matchChar[0]){
            case "\0":
                escape = "\\0";
                break;
            case "\x08":
                escape = "\\b";
                break;
            case "\x09":
                escape = "\\t";
                break;
            case "\x1a":
                escape = "\\z";
                break;
            case "\n":
                escape = "\\n";
                break;
            case "\r":
                escape = "\\r";
                break;
            case '"':
            case "'":
            case "\\":
            case "%":
                // prepends a backslash to backslash, percent, and double/single quotes
                escape = "\\" + matchChar[0];
                break;
            default:
                continue;
        }
        escapedSqlStr += sqlStr.slice(chunkIndex, matchChar.index) + escape;
        chunkIndex = matchEscSqlRx.lastIndex;
    }
    if (chunkIndex < sqlStr.length) {
        return "'" + escapedSqlStr + sqlStr.slice(chunkIndex) + "'";
    }
    return "'" + escapedSqlStr + "'";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXNjYXBlQDEuNC4yL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAyMCBKb2hubnkgXCJMZSBDaGkgRHVuZ1wiXG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5jb25zdCBtYXRjaEVzY0h0bWxSeCA9IC9bXCInJjw+XS87XG5jb25zdCBtYXRjaFVuRXNjUnggPSAvJig/OmFtcHwjMzh8bHR8IzYwfGd0fCM2MnxhcG9zfCMzOXxxdW90fCMzNCk7L2c7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWNvbnRyb2wtcmVnZXhcbmNvbnN0IG1hdGNoRXNjU3FsUnggPSAvW1xcMFxcYlxcdFxcblxcclxceDFhXCInXFxcXF0vZztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXNjYXBlKHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlbW92ZVVuRXNjU3RyID0gc3RyLnJlcGxhY2UobWF0Y2hVbkVzY1J4LCBcIlwiKTtcbiAgY29uc3QgbWF0Y2hFc2NIdG1sID0gbWF0Y2hFc2NIdG1sUnguZXhlYyhyZW1vdmVVbkVzY1N0cik7XG5cbiAgaWYgKCFtYXRjaEVzY0h0bWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaEVzY0h0bWwgPSBtYXRjaEVzY0h0bWxSeC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2hFc2NIdG1sKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuICBsZXQgZXNjYXBlO1xuICBsZXQgaHRtbCA9IFwiXCI7XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCBsYXN0SW5kZXggPSAwO1xuICBmb3IgKGluZGV4ID0gbWF0Y2hFc2NIdG1sLmluZGV4OyBpbmRleCA8IHN0ci5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBzd2l0Y2ggKHN0ci5jaGFyQ29kZUF0KGluZGV4KSkge1xuICAgICAgY2FzZSAzNDogLy8gXCJcbiAgICAgICAgZXNjYXBlID0gXCImcXVvdDtcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM4OiAvLyAmXG4gICAgICAgIGVzY2FwZSA9IFwiJmFtcDtcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM5OiAvLyAnXG4gICAgICAgIGVzY2FwZSA9IFwiJiMzOTtcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDYwOiAvLyA8XG4gICAgICAgIGVzY2FwZSA9IFwiJmx0O1wiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjI6IC8vID5cbiAgICAgICAgZXNjYXBlID0gXCImZ3Q7XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGxhc3RJbmRleCAhPT0gaW5kZXgpIHtcbiAgICAgIGh0bWwgKz0gc3RyLnN1YnN0cmluZyhsYXN0SW5kZXgsIGluZGV4KTtcbiAgICB9XG5cbiAgICBsYXN0SW5kZXggPSBpbmRleCArIDE7XG4gICAgaHRtbCArPSBlc2NhcGU7XG4gIH1cblxuICByZXR1cm4gbGFzdEluZGV4ICE9PSBpbmRleCA/IGh0bWwgKyBzdHIuc3Vic3RyaW5nKGxhc3RJbmRleCwgaW5kZXgpIDogaHRtbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5lc2NhcGUoc3RyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgbWF0Y2hVbkVzYyA9IG1hdGNoVW5Fc2NSeC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2hVbkVzYykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5lc2NhcGVIdG1sKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWF0Y2hVbkVzYyA9IG1hdGNoVW5Fc2NSeC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2hVbkVzYykge1xuICAgIHJldHVybiBzdHI7XG4gIH1cblxuICBjb25zdCByZXMgPSBzdHIucmVwbGFjZSgvJnF1b3Q7L2csICdcIicpXG4gICAgLnJlcGxhY2UoLyYjMzk7L2csIFwiJ1wiKVxuICAgIC5yZXBsYWNlKC8mI3gzQTsvZywgXCI6XCIpXG4gICAgLnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpXG4gICAgLnJlcGxhY2UoLyZndDsvZywgXCI+XCIpXG4gICAgLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKTtcblxuICByZXR1cm4gdW5lc2NhcGVIdG1sKHJlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVTcWwoc3FsU3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IG1hdGNoRXNjU3FsUnguZXhlYyhzcWxTdHIpO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuIHNxbFN0cjtcbiAgfVxuXG4gIGxldCBjaHVua0luZGV4ID0gbWF0Y2hFc2NTcWxSeC5sYXN0SW5kZXggPSAwO1xuICBsZXQgZXNjYXBlZFNxbFN0ciA9IFwiXCI7XG4gIGxldCBtYXRjaENoYXI7XG4gIGxldCBlc2NhcGU7XG5cbiAgd2hpbGUgKChtYXRjaENoYXIgPSBtYXRjaEVzY1NxbFJ4LmV4ZWMoc3FsU3RyKSkpIHtcbiAgICBzd2l0Y2ggKG1hdGNoQ2hhclswXSkge1xuICAgICAgY2FzZSBcIlxcMFwiOlxuICAgICAgICBlc2NhcGUgPSBcIlxcXFwwXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlxceDA4XCI6XG4gICAgICAgIGVzY2FwZSA9IFwiXFxcXGJcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiXFx4MDlcIjpcbiAgICAgICAgZXNjYXBlID0gXCJcXFxcdFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJcXHgxYVwiOlxuICAgICAgICBlc2NhcGUgPSBcIlxcXFx6XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlxcblwiOlxuICAgICAgICBlc2NhcGUgPSBcIlxcXFxuXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlxcclwiOlxuICAgICAgICBlc2NhcGUgPSBcIlxcXFxyXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnXCInOlxuICAgICAgY2FzZSBcIidcIjpcbiAgICAgIGNhc2UgXCJcXFxcXCI6XG4gICAgICBjYXNlIFwiJVwiOlxuICAgICAgICAvLyBwcmVwZW5kcyBhIGJhY2tzbGFzaCB0byBiYWNrc2xhc2gsIHBlcmNlbnQsIGFuZCBkb3VibGUvc2luZ2xlIHF1b3Rlc1xuICAgICAgICBlc2NhcGUgPSBcIlxcXFxcIiArIG1hdGNoQ2hhclswXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBlc2NhcGVkU3FsU3RyICs9IHNxbFN0ci5zbGljZShjaHVua0luZGV4LCBtYXRjaENoYXIuaW5kZXgpICsgZXNjYXBlO1xuICAgIGNodW5rSW5kZXggPSBtYXRjaEVzY1NxbFJ4Lmxhc3RJbmRleDtcbiAgfVxuXG4gIGlmIChjaHVua0luZGV4IDwgc3FsU3RyLmxlbmd0aCkge1xuICAgIHJldHVybiBcIidcIiArIGVzY2FwZWRTcWxTdHIgKyBzcWxTdHIuc2xpY2UoY2h1bmtJbmRleCkgKyBcIidcIjtcbiAgfVxuXG4gIHJldHVybiBcIidcIiArIGVzY2FwZWRTcWxTdHIgKyBcIidcIjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0NBR0MsR0FFRCxNQUFNLGlCQUFpQjtBQUN2QixNQUFNLGVBQWU7QUFDckIsb0NBQW9DO0FBQ3BDLE1BQU0sZ0JBQWdCO0FBRXRCLE9BQU8sU0FBUyxTQUFTLEdBQVcsRUFBVztJQUM3QyxNQUFNLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxjQUFjO0lBQ2pELE1BQU0sZUFBZSxlQUFlLElBQUksQ0FBQztJQUV6QyxJQUFJLENBQUMsY0FBYztRQUNqQixP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