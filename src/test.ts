import { ArrayUtils } from './utils/ArrayUtils';
const arr = [{ date: new Date(), name: 'lalex' }, { date: new Date(new Date().getTime() - 5948), name: 'before' }, { date: new Date(new Date().getTime() + 32186), name:'after' }];
console.log([...arr]);
ArrayUtils.sortBy(arr, 'date');
console.log([...arr]);