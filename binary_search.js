function wrapComparator(func) {
    return function(a, b) {
        return new Promise(function(resolve, reject) {
            resolve(func(a, b));
        });
    }
}

function promiseBinarySearch(haystack, needle, compare, low, high) {
    if (compare === undefined) {
        if (typeof needle === 'number') {
            compare = wrapComparator(function(a, b) { return a - b; });
        } else if (typeof needle === 'string') {
            compare = wrapComparator(function(a, b) { return a.localeCompare(b); });
        } else {
            throw new Error('no default comparator available for this type of needle');
        }
    }
    if (low === undefined) { low = 0; }
    if (high === undefined) { high = haystack.length - 1; }
    
    return new Promise(function(resolve, reject) {
        // needle wasn't found, resolve with the position of where it would go in the sorted array.
        if (low > high) { 
            resolve([false, low]); 
            return;
        }
        
        var mid = low + Math.floor((high - low) / 2);
        
        compare(needle, haystack[mid]).then(function(compareResult) {
            if (compareResult === 0) {
                resolve([true, mid]);
            } else if (compareResult > 0) {
                promiseBinarySearch(haystack, needle, compare, mid + 1, high).then(resolve).catch(reject);
            } else if (compareResult < 0) {
                promiseBinarySearch(haystack, needle, compare, low, mid - 1).then(resolve).catch(reject);
            } else {
                reject('unexpected result from comparison function: ' + compareResult);
            }
        }).catch(reject);
    });
}

// function test_promiseBinarySearch(haystack, searches) {
//     let zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));
//     Promise.all(searches.map(needle => promiseBinarySearch(haystack, needle))).then(results => console.log(zip([searches, results])));
// }
// test_promiseBinarySearch(['a','b','c','d','f','g','h'], ['a', 'q', 'z', 'd', '1', 'e']);
// test_promiseBinarySearch([1,3,5,7,9,11], [1,2,3,4,5,6,7,8,9]);
