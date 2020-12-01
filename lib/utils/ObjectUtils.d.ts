export default class ObjectUtils {
    static uid(o: any): string | null;
    static clearUid(o: any): void;
    static mapKeys(o: any, fct: (key: string) => string, deep?: boolean): any;
    static map<T>(o: T, fct: (value: any, key?: string) => any): any;
    static toRegistry<T = any>(a: T[], key: keyof T | ((o: T) => string)): {
        [key: string]: T;
    };
    static isEmpty(o: any): boolean;
    static pick<T = any>(source: T, fields?: (keyof T | {
        [targetKey: string]: keyof T | ((o: T) => any);
    })[]): Partial<T>;
    static exclude<T = any>(source: T, fields: (keyof T)[]): Partial<T>;
    static assign<T = any, S = any>(target: T, source: S, fields?: (keyof S | {
        [targetKey: string]: keyof S | ((o: S) => any);
    })[]): void;
    static isDifferent<T>(o1: T, o2: T, fields: (keyof T)[], strict?: boolean): boolean;
    static isDefined(o: any): boolean;
}
