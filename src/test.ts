import { ObjectUtils } from "./utils/ObjectUtils";

const obj = { test: true, label: "MyObject" };
const picked = ObjectUtils.pick(obj, ["label"]);
console.log(picked);