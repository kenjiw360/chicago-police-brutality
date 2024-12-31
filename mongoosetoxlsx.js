const fs = require("fs");
const mongoose = require("mongoose");
const reader = require('xlsx');

mongoose.connect("mongodb://localhost:27017/misconduct");

function savexlsx(){
	console.log("start saving process");
	Allegation.find({

	}, function (err,data){
		fs.exists("./static/sheet.xlsx", function (res){
			if(!res) return fs.writeFile("./static/sheet.xlsx", "", run);
			run();
			function run(){
				var arr = [];

				data.forEach(function (obj){
					arr.push(obj._doc);
				})

				var file = reader.readFile('./blank.xlsx');
				var ws = reader.utils.json_to_sheet(arr);
				reader.utils.book_append_sheet(file,ws,"Data");
				reader.writeFile(file,"./static/sheet.xlsx");
			}
		})
	})
}

savexlsx();

// Reading our test file
setInterval(savexlsx,600000);