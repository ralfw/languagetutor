export function Store(filename: string, words: string[]) {
  const content = words.join("\n");
  Deno.writeTextFileSync(filename, content);
}



export function Load(filename: string): string[] {
  const file = Deno.readTextFileSync(filename);
  const words = file.trim()
                    .split("\n")
                    .filter(line => line.trim() !== "")
                    .map(line => line.trim());
  return words;
}

