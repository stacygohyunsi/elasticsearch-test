const express = require('express');
const bodyParser = require('body-parser');
const service = require("./service.js");
const uuid = require("uuid");

var app = express();
app.use(bodyParser.json());

//runTestRetrieve1();
//runTestQuery();
//runTestRetrieve25();

// query
function runTestQuery() {
	var names = ['jan,', 'jey', 'renee', 'audrey', 'samuel', 'stacy', 'vanessa', 'ddf', 'ivan', 'oikos'];
	setInterval(function() {
		var index = Math.floor(Math.random() * 9) + 0;
		service.search(names[index]).then(function(data) {
			console.log("took time: ", data.took);
		})
	}, 2000);
}

// retrieve 25
function runTestRetrieve25() {
	var id = 1;
	setInterval(function() {
		var hundredRand = [];
		for (var i=0; i<25; i++) {
			var randNumber = Math.floor(Math.random() * 100000) + 1;
			hundredRand.push(randNumber);
		}
		service.get("oikos", hundredRand, {}).then(function(data){
		}).catch(function(err) {
			console.log(err);
			throw new Error();
		});
	}, 200);
}

// retrieve 1
function runTestRetrieve1() {
	var id = 1;
	setInterval(function() {
		var randNumber = Math.floor(Math.random() * 100000) + 1;
		service.get("oikos", [randNumber], {}).then(function(data){
		}).catch(function(err) {
			console.log(err);
			throw new Error();
		});
	}, 200);
}


app.listen('1337');
console.log(`server running at port 1337`);
