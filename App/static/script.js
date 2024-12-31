document.querySelector("button").addEventListener("click", function (){
	navigator.geolocation.getCurrentPosition(function(position){
		fetch(`http://localhost:3000/submitmisconduct?OfficerFirst=${document.querySelector("#firstname").value }&OfficerLast=${document.querySelector("#lastname").value}&Longitude=${position.coords.longitude}&Latitude=${position.coords.latitude}&CRID=${document.querySelector("#crid").value}`, {
			mode: "no-cors"
		})
	});
})