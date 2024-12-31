var fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
	const converter = require('json-2-csv');
	const fs = require("fs");
	var allResponses = require('./static/response.json')
	var officers = {};
	function responsesloop(index){
		console.log("hello")
		return new Promise(function (resolve, reject){
			var response = allResponses[index];
			response.officers.forEach(function (officer,i){
				if(!response.allegation.officers) response.allegation.officers = [];
				response.allegation.officers.push(officer.officer_first+" "+officer.officer_last);
				
				if(!Object.keys(officers).includes(officer.id)){
					fetch("https://api.cpdp.co/api/v2/officers/"+officer.id+"/summary")
					.then(async function (response){
						const body = await response.text();
						try {
							return JSON.parse(body);
						} catch (err) {
							setTimeout(function (){
								responsesloop(index)
							},1000*5)
						}
					})
					.then(function (res){
						if(res == undefined) return;
						console.log(res)
						delete res.percentiles;
						officers[officer.id] = res;
						console.log(officers);

						if(index < allResponses.length) return resolve(index+1);
						reject("finished");
					})
				}else{
					resolve(index+1);
					if(index < allResponses.length) return resolve(index+1);
				reject("finished");
				}
			})
		}).then(responsesloop)
		.catch(function (){
			console.log("starting conversion to officers csv", officers)
			converter.json2csv(Object.values(officers), (err, csv) => {
				if (err) {
				  throw err
				}
			  
				// print CSV string
				fs.writeFileSync('./officers.csv', csv)
			})
		})
	}

	responsesloop(0);

	var allegation = allResponses.map(response => response.allegation);

	converter.json2csv(allegation, (err, csv) => {
		if (err) {
		  throw err
		}
	  
		// print CSV string
		fs.writeFileSync('./allegations.csv', csv)
	})

})()