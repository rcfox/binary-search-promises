var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var assert = chai.assert;
var expect = chai.expect;
var should = require('chai').should();

var binarySearch = require('../lib/index');

describe('binary search', function() {
    describe('wrapComparator', function() {
        it('should create a function that returns a Promise that resolves to the result of the wrapped function', function() {
            var func = binarySearch.wrapComparator(function(a, b) {return a - b;});
            func(1, 2).should.respondTo('then'); // The babel runtime uses a local promise type, so just check that it's thenable.
            func(1, 2).should.eventually.equal(-1);
        });
    });
    describe('numbers', function() {
        it('should not find a value in an empty array', function() {
            binarySearch([], 1).should.eventually.contain(false);
        });

        var haystack = [0, 2, 4, 6, 8, 10];
        haystack.forEach(function(needle) {
            var expectedPosition = needle / 2;
            it('should find ' + needle + ' at position ' + expectedPosition, function() {
                binarySearch(haystack, needle).should.eventually.be.deep.equal([true, expectedPosition]);
            });
        });

        var not_found = {
            0.1: 1,
            4.5: 3,
            100: 6,
            7: 4,
            Infinity: 6
        };
        not_found[-1] = 0;
        not_found[-Infinity] = 0;

        // I guess object keys get turned into strings, so I need to make sure they're treated as numbers.
        var numberComparator = binarySearch.wrapComparator(function(a, b) { return a - b; });

        Object.keys(not_found).forEach(function(needle) {
            var expectedPosition = not_found[needle];
            it('should not find ' + needle + ' in the haystack, but it would go in position ' + expectedPosition, function() {
                binarySearch(haystack, needle, numberComparator).should.eventually.be.deep.equal([false, expectedPosition]);
            });
        });
    });
    describe('strings', function() {
       var haystack = ['a', 'c', 'e', 'g', 'i'];
        haystack.forEach(function(needle, expectedPosition) {
            it('should find ' + needle + ' at position ' + expectedPosition, function() {
                binarySearch(haystack, needle).should.eventually.be.deep.equal([true, expectedPosition]);
            });
        });
        var not_found = {
            'z': 5,
            '1': 0,
            'cat': 2,
            '': 0
        };
        Object.keys(not_found).forEach(function(needle) {
            var expectedPosition = not_found[needle];
            it('should not find ' + needle + ' in the haystack, but it would go in position ' + expectedPosition, function() {
                binarySearch(haystack, needle).should.eventually.be.deep.equal([false, expectedPosition]);
            });
        });
    });
    describe('objects', function() {
        var objects = [
            {'a': 9, 'b': 5, 'c': 13},
            {'a': 1, 'b': 1, 'c': 30},
            {'a': 6, 'b': 7, 'c': 45},
            {'a': 3, 'b': 3, 'c': -1}
        ];
        var not_found = [
            {'a': 19, 'b': 15, 'c': 113},
        ];

        var comparators = {
            'a': function(a, b) { return a.a - b.a; },
            'b': function(a, b) { return a.b - b.b; },
            'c': function(a, b) { return a.c - b.c; }
        };

        Object.keys(comparators).forEach(function(comparatorName) {
            it('should be searchable by the "' + comparatorName + '" property', function() {
                var cmp = comparators[comparatorName];
                var cmpPromiseFactory = binarySearch.wrapComparator(cmp);

                var haystack = objects.slice().sort(cmp);

                objects.forEach(function(needle) {
                    binarySearch(haystack, needle, cmpPromiseFactory).should.eventually.contain(true);
                });
                not_found.forEach(function(needle) {
                    binarySearch(haystack, needle, cmpPromiseFactory).should.eventually.contain(false);
                });
            });
        });
    });
});
