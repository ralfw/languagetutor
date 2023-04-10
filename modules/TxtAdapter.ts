export function Store(filename: string, words: string[]) {
  const content = words.join("\n");
  Deno.writeTextFileSync(filename, content);
}
