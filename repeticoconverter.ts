import { Store } from "./modules/TxtAdapter.ts"
import { Parse } from "./modules/CmdlinePortal.ts"
import { Load } from "./modules/RepeticoJsonAdapter.ts"
import { Map } from "./modules/ConverterCore.ts"


const prms = Parse(Deno.args);
const cards = Load(prms.jsonFilepath);
const words = Map(cards);
Store(prms.txtFilepath, words);

console.log(words.length + " cards converted and stored in " + prms.txtFilepath)