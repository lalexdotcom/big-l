import { LS } from ".";
import { Case } from "./utils/StringUtils";

console.log(LS.changeCase("variable_name", Case.SNAKE));
console.log(LS.changeCase("6-th-floor", Case.PASCAL));
console.log(LS.guessCase("6th-floor"));