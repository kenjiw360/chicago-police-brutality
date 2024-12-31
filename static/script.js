import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
var socket = io();

var resLength;
var shouldRotate = true;
var stuck = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector("fullpage#main").appendChild( renderer.domElement );


const globeGeometry = new THREE.SphereGeometry( 2, 60, 30);
const material = new THREE.MeshLambertMaterial({
	map: new THREE.TextureLoader().load("map.jpeg"),
	color: 0xFFFFFF,
	transparent:true,
	opacity:0
});


const globe = new THREE.Mesh( globeGeometry, material );
scene.add(globe);

const skyboxGeometry = new THREE.SphereGeometry( 20, 60, 30);
const skymaterial = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load("https://raw.githubusercontent.com/ankit-alpha-q/glowing-sun/master/public/texture/galaxy1.png"),
	side: THREE.BackSide
	
});


const skybox = new THREE.Mesh( skyboxGeometry, skymaterial );
scene.add(skybox);

const spotLight = new THREE.SpotLight(0xb0e6ff);
spotLight.position.set( 10,10,10 );

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 0, 0);
controls.enableZoom = false;
controls.enablePan = false;
controls.update();


const line = new THREE.CylinderGeometry( 0.01, 0.01, 20, 32 );
line.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -10, 0));
const red = new THREE.MeshLambertMaterial({
	color: 0xff0000,
	transparent:true,
	opacity:1,
	emissive: 0xFFFFFF
});

function createPin(longitude,latitude, data){
	var cylinder = new THREE.Mesh(line.clone(), red.clone());
	cylinder.rotation.y = longitude*Math.PI/180;
	cylinder.rotation.z = Math.PI/2+latitude*Math.PI/180;
	cylinder.data = data;

	cylinder.material.emissive = new THREE.Color((data.Outcome == "No Action Taken") ? 0xFF0000 : 0x00FF00);
	scene.add(cylinder);

	function animater(){
		requestAnimationFrame(animater);

		cylinder.rotation.y = longitude*Math.PI/180+globe.rotation.y;

		controls.update();
		renderer.render( scene, camera );
	}
	animater();

	setTimeout(function (){
		var deleteCylinder = setInterval(function (){
			cylinder.material.opacity-=0.1;
			if(cylinder.material.opacity <= 0){
				scene.remove(cylinder);
				clearInterval(deleteCylinder);
			}
		},50/3)
	},4000)
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function animate(){
	requestAnimationFrame(animate);
	if(shouldRotate){
		globe.rotation.y += 0.0005;
	}

	controls.update();
	renderer.render( scene, camera );
}
animate();

renderer.domElement.addEventListener("click", function (event){
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( pointer, camera );
	const intersect = raycaster.intersectObjects(scene.children);
	if(intersect[0].object.geometry.type == "Geometry"){
		shouldRotate = false;
		document.querySelector("#menu").setAttribute("showing","true");
		document.querySelector("#menu > #CRID").innerText = "CRID: "+intersect[0].object.data.CRID;
		document.querySelector("#menu > #name").innerText = intersect[0].object.data.OfficerFirst+" "+intersect[0].object.data.OfficerLast;
		document.querySelector("#menu #actiontaken").innerText = intersect[0].object.data.Outcome;
		document.querySelector("#menu #actiontaken").style.color = (intersect[0].object.data.Outcome == "No Action Taken") ? "red" : "lime";
	};
})

renderer.domElement.addEventListener("mousemove", function (event){
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( pointer, camera );
	const intersect = raycaster.intersectObjects(scene.children);
	document.body.style["cursor"] = (intersect[0].object.geometry.type == "Geometry") ? "pointer" : "auto";
})

renderer.domElement.addEventListener("mousedown",() => {
	shouldRotate = false;
	stuck = false;
})
renderer.domElement.addEventListener("mouseup",function (){
	setTimeout(function (){
		if(!stuck) shouldRotate = true
	},2000)	
})

var alreadyclicked = false;


document.body.addEventListener("click", function (){
	if(alreadyclicked) return;
	alreadyclicked = true;
	document.querySelector("i#clickanywhere").remove();
	document.querySelector("h1").style.transform = "none";
	document.querySelector("h1").style.fontSize = "4em";
	document.querySelector("h1").style.top = "20px";
	document.querySelector("h1").style.left = "20px";
	document.body.setAttribute("showing","true");

	setTimeout(function (){
		var showGlobe = setInterval(function (){
			globe.material.opacity+=0.1;
			if(globe.material.opacity >= 1){
				clearInterval(showGlobe);
			}
		},50/3)
	},1000)

	var scrolltrigger = 0;

	window.addEventListener("scroll", function (e){
		if(window.scrollY >= 1*window.innerHeight && scrolltrigger == 0){
			scrolltrigger++
			document.querySelector("#crimecounterbg").setAttribute("showing","true");
			setTimeout(function (){
				document.querySelector("#crimecounter").innerText = "0";
				document.querySelector("#numberofcrimes").setAttribute("showing","true");
				var crimeCounter = setInterval(function (){
					document.querySelector("#crimecounter").innerText = (Math.min(parseInt(document.querySelector("#crimecounter").innerText.replaceAll(",",""))+2346,resLength)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					if(parseInt(document.querySelector("#crimecounter").innerText.replaceAll(",","")) >= resLength){
						clearInterval(crimeCounter);
					}
				},40);
			},300)

			setTimeout(function (){
				document.querySelector("#footer").style.display = "block";
				document.querySelector("#footer").style.opacity = "1";
			},1000)
		}
	})
}, true)

window.addEventListener('resize', function (){
	const width = window.innerWidth;
	const height = window.innerHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
});

window.addEventListener("mousemove", function (e){
	document.querySelector("#crimecounterbg").style.transform = `translate(calc(-50% + ${(e.clientX/window.innerWidth-0.5)*20}px),calc(-50% + ${(e.clientY/window.innerHeight-0.5)*20}px)) rotateX(${(e.clientY/window.innerHeight-0.5)*10}deg) rotateY(${-(e.clientX/window.innerWidth-0.5)*10}deg)`;
})

socket.on("addpin", function (data){
	createPin(data.Longitude,data.Latitude,data);
})

fetch("/api")
.then((response) => response.text())
.then(function (response){
	resLength = response.replace("Value: ","");
})