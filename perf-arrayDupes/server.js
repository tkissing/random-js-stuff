var Benchmark = require('benchmark');
var seed = require('seed-random');

seed('foo', true);

function randomFromInterval(from,to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function createRandomArray(size, max, min) {
	var array = [], i;

	for (i = size; i--;) {
		array.push(randomFromInterval(min || 1, max || size));
	}

	return array;
}

function dupesWithIndex(array) {
	var dupes = [], i, l, v;

	for (i = 0, l = array.length; i < l; i++) {
		v = array[i];
		if (dupes.indexOf(v) < 0) {
			if (array.indexOf(v) != i || array.lastIndexOf(v) != i) {
				dupes.push(v);
			}
		}
	}
	return dupes;
}

function dupesWithHash(array){
	var hash = {};
	var duplicates = [];
	for(var i = 0, len = array.length; i < len; i++){
		var item = array[i];
		var hashLookup = hash[item.toString()];
		if (hashLookup) {
			if (hashLookup == 1) {
				duplicates.push(item);
			}
			hash[item.toString()] = hashLookup+1;
		} else {
			hash[item.toString()] = 1;
		}
	}
	return duplicates;
}

function dupesWithLoops(arr) {
	var obj = {}, dupes =[];
	for(var i=0;i < arr.length; i++) {
		obj[arr[i]] = typeof obj[arr[i]] !== 'undefined' ? obj[arr[i]] + 1 : 0;
	}
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop) && obj[prop] > 0 ){
			dupes.push(prop);
		}
	}
	return dupes;
}

function describeDataSet(array, options) {
	var hash = {}, dupes = 0, uniqDupes = 0;
	for(var i = 0, len = array.length; i < len; i++){
		var item = String(array[i]);

		hash[item] = hash[item] ? hash[item] + 1 : 1;
	}

	for (var prop in hash) {
		if (hash.hasOwnProperty(prop) && hash[prop] > 1) {
			uniqDupes += 1;
			dupes += hash[prop] - 1;
		}
	}

	console.log({
		'max': options.max,
		'length': array.length,
		'dupe %': 100*dupes/array.length,
		'uniq dupe %': 100*uniqDupes/array.length
	});
}

var sets = [
	{size: 1e1, max: 1e1},
	{size: 1e1, max: 1e2},

	{size: 1e2, max: 1e1},
	{size: 1e2, max: 1e2},
	{size: 1e2, max: 1e3},

	{size: 1e3, max: 1e1},
	{size: 1e3, max: 1e2},
	{size: 1e3, max: 1e3},
	{size: 1e3, max: 1e4},

	{size: 1e4, max: 1e1},
	{size: 1e4, max: 1e2},
	{size: 1e4, max: 1e3},
	{size: 1e4, max: 1e4},
	{size: 1e4, max: 1e5}
];


sets.forEach(function(v) {
	var suite = new Benchmark.Suite;
	var array = createRandomArray(v.size, v.max);

	// add tests
	suite
	.on('start', function(event) {
		describeDataSet(array, v);
	})
	.add('dupesWithIndex', function() {
	  dupesWithIndex(array);
	})
	.add('dupesWithLoops', function() {
	  dupesWithLoops(array);
	})
	.add('dupesWithHash', function() {
	  dupesWithHash(array);
	})
	// add listeners
	.on('cycle', function(event) {
	  console.log(String(event.target));
	})
	.on('complete', function() {
	  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
	})
	// run sync
	.run({ 'async': false });	
})
