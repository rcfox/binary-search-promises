/**
 * Wrap a normal comparison function in a Promise that resolves to the result of the comparison.
 * @param {function(X, X): number} func
 * @return {function(X, X): Promise<number>}
 */
function wrapComparator(func) {
    return function(a, b) {
        return Promise.resolve(func(a, b));
    };
}

/**
 * Binary search `haystack`, looking for `needle`. Promises are used to allow for asynchronous comparison functions.
 *
 * @param {Array<X>} haystack - The array to be searched. Must be sorted.
 * @param {X} needle - The element to search for in haystack.
 * @param {function(X, X): Promise<number>)=} compare - The comparison function.
 * It must return a Promise that resolves to the result of the comparison. (0: equal, positive: greater than, negative: less than)
 * Default comparators are provided for numbers and strings if this parameter is omitted.
 * If `X` is not number or string, this is NOT optional.
 * @param {number=} low - The lower bound of `haystack` to use. Optional.
 * @param {number=} high - The upper bound of `haystack` to use. Optional.
 * @return {Promise<[boolean, number]>} - A Promise that resolves to an array of two values. The first value indicates whether `needle` was found.
 * The second value is the position of `needle`, if it was found, or where it would go if it's not found.
 */
async function promiseBinarySearch(haystack, needle, compare, low, high) {
    if (compare === undefined) {
        if (typeof needle === 'number') {
            compare = wrapComparator(function(a, b) { return a - b; });
        } else if (typeof needle === 'string') {
            compare = wrapComparator(function(a, b) { return a.localeCompare(b); });
        } else {
            return Promise.reject('no default comparator available for this type of needle');
        }
    }
    if (low === undefined) { low = 0; }
    if (high === undefined) { high = haystack.length - 1; }

    // needle wasn't found, resolve with the position of where it would go in the sorted array.
    if (low > high) {
        return Promise.resolve([false, low]);
    }

    var mid = low + Math.floor((high - low) / 2);

    let compareResult = await compare(needle, haystack[mid]);
    if (compareResult === 0) {
        return Promise.resolve([true, mid]);
    } else if (compareResult > 0) {
        return promiseBinarySearch(haystack, needle, compare, mid + 1, high);
    } else if (compareResult < 0) {
        return promiseBinarySearch(haystack, needle, compare, low, mid - 1);
    } else {
        return Promise.reject('unexpected result from comparison function: ' + compareResult);
    }
}

module.exports = promiseBinarySearch;
module.exports.wrapComparator = wrapComparator;
