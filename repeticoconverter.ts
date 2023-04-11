// Usage: deno run --allow-all repeticoconverter.ts <repetico.json filename>

import { Store } from "./modules/TxtAdapter.ts";
import { Parse } from "./modules/repeticoconverter/CmdlinePortal.ts";
import { Load } from "./modules/repeticoconverter/RepeticoJsonAdapter.ts";
import { Map } from "./modules/repeticoconverter/ConverterCore.ts";

const prms = Parse(Deno.args);
const cards = Load(prms.jsonFilepath);
const words = Map(cards);
Store(prms.txtFilepath, words);

console.log(words.length + " cards converted and stored in " + prms.txtFilepath);
