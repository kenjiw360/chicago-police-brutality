//scrapes data from API and turns it into json file
async function safeParseJSON(response) {
	var o = i;
    const body = await response.text();
    try {
        return JSON.parse(body);
    } catch (err) {
		console.log("failed, starting setTimeout");
		setTimeout(function(){
			console.log("5 minutes has passed");
			fetch(`https://data.cpdp.co/api/officer-allegations/?cat__category=Operation%2FPersonnel%20Violations&page=${o}&length=50`)
			.then(safeParseJSON)
			.then(function (response){
				if(!response) return;
				response.officer_allegations.forEach(function (x){
					arr.push(x);
					console.log(arr.length);
					if(arr.length == 78356){
						fs.writeFile("./static/response.json",new Buffer.from(JSON.stringify(arr)), () => {
							console.log("finished")
						});
					}
				})
			})
		},5*60*1000);
        
    }
}

var fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var fs = require("fs");

var arr = [];
var i = 0;

setInterval(function (){
	if(i<Math.ceil(78356/50)){
		fetch(`https://data.cpdp.co/api/officer-allegations/?cat__category=Operation%2FPersonnel%20Violations&page=${i}&length=50`)
		.then(safeParseJSON)
		.then(function (response){
			if(i==0){
				console.log(response);
			}
			if(response){
				response.officer_allegations.forEach(function (x){
					arr.push(x);
					console.log(arr.length);
					if(arr.length == 78356){
						fs.writeFile("./static/response.json",new Buffer.from(JSON.stringify(arr)), () => {
							console.log("finished")
						});
					}
				})
			}
		})
	}
	i++;
},1000);