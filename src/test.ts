import { ObjectUtils } from "./utils/ObjectUtils";
import { ArrayUtils } from "./utils/ArrayUtils";

const obj1 = { store: { name: "ZZZZ" } }, obj2 = { store: { name: "AAAA" } };
const sf = ArrayUtils.sortFunction("store.name");
console.log(sf(obj1, obj2));
