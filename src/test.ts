// import { readFileSync } from "fs";
// import path from "path";
// import { StringUtils } from "./utils/StringUtils";

// process.stdin.resume();
// (async () => {
// 	console.debug("%%salut");
// 	let str = `test "{{lalex??{{obj.key}}:test}}" et aussi '{{obj.key}}' '{{obj.bar}}' tant que {{arr.1}} est vrai`;
// 	// const str = readFileSync(path.resolve(__dirname, "json.json5"), "utf8");
// 	const vars = { lalex: "123", obj: { key: "foo", bar: 123 }, arr: ["456", 789] };
// 	// console.log(str, "=>", StringUtils.template(str, vars));
// 	console.log(str, "=>", StringUtils.template(str, vars));
// 	console.log(str, "=> (json)", StringUtils.template(str, vars, true));
// 	process.exit(0);
// })();
