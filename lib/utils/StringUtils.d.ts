export declare enum Case {
    CAMEL = 0,
    SNAKE = 1,
    KEBAB = 2,
    PASCAL = 3
}
export default class StringUtils {
    static capitalize(str: string, separator?: string): string;
    static toFilename(str: string, ...following: string[]): string;
    static normalize(str: string): string;
    private static splitFromCase;
    private static joinToCase;
    static changeCase(str: string, fromCase: Case, toCase: Case): string;
    static camelToSnake(str: string): string;
    static snakeToCamel(str: string): string;
}
