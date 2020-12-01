import StringUtils, { Case } from './utils/StringUtils';

export const LS = StringUtils;

console.log(LS.changeCase("testName", Case.CAMEL, Case.PASCAL));