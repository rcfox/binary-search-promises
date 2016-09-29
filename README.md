# binary-search-promises
Javascript library to do binary search using promises. This allows for asynchronous comparison functions.

# Usage

## Install

    npm install binary-search-promises

## Arguments
    function binarySearch(haystack, needle, compare, low, high)

* `haystack` - A sorted array.
* `needle` - The element to find in `haystack`.
* `compare` - A comparison function, with a twist. Instead of returning a result directly, it must return a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) that will resolve to the comparison result. (The comparison algorithm should be the same as the one used to sort.)
* `low` - Optional lower bound of the haystack to consider. You probably don't need to use this.
* `high` - Optional upper bound of the haystack to consider. You probably don't need to use this.

`compare` is optional if dealing with numbers or strings.

If, for some reason, you want to use a synchronous comparison function, you can wrap it with `binarySearch.wrapComparator()`.

## Return

The function returns an array of two values:

* The first value indicates whether the `needle` was found in the `haystack`.
* The second value is the position of `needle` in `haystack`, if it was found. If it was not found, then it is the position where it should be inserted to maintain the sorting order.

# Example

    let binarySearch = require('binary-search-promises');

    let haystack = [1,2,3,4,5,6,7,8,9];
    let needle = 4;

    binarySearch(haystack, needle, function(a, b) {
        let req = new Request(`/secret-comparison-algorithm/${a}/{$b}/`);
        fetch(req).then(function(response) {
            // For this example, the response comes back as one of -1, 0, or 1 as plain text.
            // text() returns a Promise that resolves to that text.
            return response.text();
        }).catch(function(reason) {
            return Promise.reject(reason);
        });
    }).then(function(resolution) {
        let [found, position] = resolution;
        if (found) {
            console.log(`${needle} is at ${position}`);
        } else {
            console.log(`${needle} should be inserted at ${position}`);
        }
    }).catch(function(reason) {
        console.error(reason);
    });

Okay, that's a silly example. You're probably not going to be doing asynchronous comparisons on numbers.
