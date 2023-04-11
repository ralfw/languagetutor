export interface CmdlineParams {
  jsonFilepath: string;
  txtFilepath: string;
}

export function Parse(args:string[]): CmdlineParams {
  if (args.length < 1) {
    throw new Error('Missing JSON filename as first parameter on command line.');
  }

  const jsonFilepath = args[0];
  const txtFilepath = jsonFilepath.replace(/\.json$/, '.txt');

  return { jsonFilepath, txtFilepath };
}