const { mongoose, Schema } = require("mongoose");
const reader = require('xlsx');

mongoose.connect("mongodb://localhost:27017/misconduct");

// Reading our test file
const file = reader.readFile('./allegation.xlsx')
  
const sheets = file.SheetNames;

const temp = reader.utils.sheet_to_json(file.Sheets["Allegations"])
temp.forEach((res) => {
	var saveThis = new Allegation({
		CRID: res.CRID,
		OfficerID: res.OfficerID,
		OfficerFirst: res.OfficeFirst,
		OfficerLast: res.OfficerLast,
		IncidentDate: res.IncidentDate,
		Latitude: res.Latitude,
		Longitude: res.Longitude,
		Category: res.Category,
		Outcome: res.Outcome
	})
	saveThis.save();
})

console.log(temp)