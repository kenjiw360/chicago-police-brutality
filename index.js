const { mongoose, Schema} = require("mongoose");
mongoose.connect("mongodb://localhost:27017/misconduct");

global.Allegation = mongoose.model("Allegations", new Schema({
	CRID: String,
	OfficerID: Number,
	OfficerFirst: String,
	OfficerLast: String,
	IncidentDate: {
		type: String,
		default: () => new Date().toISOString().split("T")[0]+" 00:00:00"
	},
	Latitude: Number,
	Longitude: Number,
	Category: String,
	Outcome: String,
	Witnesses: Array,
	extraInfo: {
		type: Object,
		default: {}
	}
}));

const express = require("express");

const app = express();

app.use("/",express.static("./static"));

app.get("/api", function (req,res){
	Allegation.find(function (err,resr){
		res.send("Value: "+resr.length);
	})
})

app.get("/submitmisconduct", function (req,res){
	var newAllegation = new Allegation({
		OfficerFirst: req.query.OfficerFirst,
		OfficerLast: req.query.OfficerLast,
		Longitude: req.query.Longitude,
		Latitude: req.query.Latitude,
		Category: req.query.Category,
		CRID: req.query.CRID,
		Outcome: "No Action Taken"
	});

	newAllegation.save();

	var io = req.app.get('socketio');
	io.emit('addpin', newAllegation);
});

const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.set("socketio",io);

server.listen(3000, console.log("listening on port 3000"));

require("./mongoosetoxlsx.js")