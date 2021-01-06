var pointLight, sun, moon, earth, earthOrbit, ring, controls, scene, camera, renderer;
var planetSegments = 48;
var earthData = constructPlanetData(365.2564, 0.015, 25, "earth", "img/earth.jpg", 1, planetSegments);
var edoData = constructPlanetData(65.2564, 0.015, 40, "edo", "img/edo.png", 4, planetSegments);
var boolData = constructPlanetData(200, 0.015, 60, "bool", "img/bool.png", 6, planetSegments);
var moonData = constructPlanetData(29.5, 0.01, 2.8, "moon", "img/moon.jpg", 0.5, planetSegments);
var orbitData = {value:200, runOrbit:true, runRotation:true};
var clock = new THREE.Clock();

// constructor for planet object
function constructPlanetData(myOrbitRate, myRotationRate, myDistanceFromAxis, myName, myTexture, mySize, mySegments){
  return{
    orbitRate: myOrbitRate,
    rotationRate: myRotationRate,
    distanceFromAxis: myDistanceFromAxis,
    name: myName,
    texture: myTexture,
    size: mySize,
    segments: mySegments
  };
}
// function creating orbit ring
function getRing(size, innerDiameter, facets, myColor, name, distanceFromAxis){
  var ring1Geometry = new THREE.RingGeometry(size, innerDiameter, facets);
  var ring1Material = new THREE.MeshBasicMaterial({color: myColor, side: THREE.DoubleSide});
  var myRing = new THREE.Mesh(ring1Geometry, ring1Material);
  myRing.name = name;
  myRing.position.set(distanceFromAxis,0,0);
  myRing.rotation.x = Math.PI / 2;
  scene.add(myRing);
  return myRing;
}
// function creating orbit tube
function getTube(size, innerDiameter, radialFacets, facets, myColor, name, distanceFromAxis){
  var ringGeometry = new THREE.TorusGeometry(size, innerDiameter, radialFacets, facets);
  var ringMaterial = new THREE.MeshBasicMaterial({color: myColor, side: THREE.DoubleSide});
  var myRing = new THREE.Mesh(ringGeometry, ringMaterial);
  myRing.name = name;
  myRing.position.set(distanceFromAxis,0,0);
  myRing.rotation.x = Math.PI / 2;
  scene.add(myRing);
  return myRing;
}
// function basic material skin for planet
function getMaterial(type, color, myTexture){
  var materialOption = {
    color: color === undefined ? 'rgb(255,255,255)' : color,
    map: myTexture === undefined ? null : myTexture,
  };
  switch(type){
    case 'basic':
      return new THREE.MeshBasicMaterial(materialOption);
    case 'lambert':
      return new THREE.MeshLambertMaterial(materialOption);
    case 'phong':
      return new THREE.MeshPhongMaterial(materialOption);
    case 'standard':
      return new THREE.MeshStandardMaterial(materialOption);
    default:
      return new THRE.MeshBasicMaterial(materialOption);
  }
}


// create visible orbits
function createVisibleOrbits(){
  var orbitWidth = 0.01;
  earthOrbit = getRing(earthData.distanceFromAxis + orbitWidth,earthData.distanceFromAxis - orbitWidth, 320, 0xFFFFFF, "earthOrbit", 0);
}


// creating function sphere constructor

function getSphere(material, size, segments){
  var geometry = new THREE.SphereGeometry(size, segments, segments);
  var obj = new THREE.Mesh(geometry, material);
  obj.castShadow = true;
  return obj;
}

// function loading texture to the planet
function loadTexturedPlanet(myData, x, y, z, myMaterialType){
  var myMaterial;
  var passThisTexture;
  if (myData.texture && myData.texture !=="") {
    passThisTexture = new THREE.ImageUtils.loadTexture(myData.texture);
  }
  if (myMaterialType) {
    myMaterial = getMaterial(myMaterialType, "rgb(255,255,255)", passThisTexture);
  }else{
    myMaterial = getMaterial("lambert", "rgb(255,255,255)", passThisTexture);
  }
  myMaterial.receiveShadow = true;
  myMaterial.castShadow = true;
  var myPlanet = getSphere(myMaterial, myData.size, myData.segments);
  myPlanet.receiveShadow = true;
  myPlanet.name = myData.name;
  scene.add(myPlanet);
  myPlanet.position.set(x, y, z);
  return myPlanet;
}

// create point light
function getPointLight(intensity, color){
  var light = new THREE.PointLight(color, intensity);
  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  return light;
}

// function for move the planet
function movePlanet(myPlanet, myData, myTime, stopRotation){
  if (orbitData.runRotation && !stopRotation) {
    myPlanet.rotation.y += myData.rotationRate;
  }
  if (orbitData.runOrbit) {
    myPlanet.position.x = Math.cos(myTime*(1.0/(myData.orbitRate * orbitData.value)) + 10.0) * myData.distanceFromAxis;
    myPlanet.position.z = Math.sin(myTime*(1.0/(myData.orbitRate * orbitData.value)) + 10.0) * myData.distanceFromAxis;
  }
}

// function yo move planet around another planetSegments
function moveMoon(myMoon , myPlanet, myData, myTime){
  movePlanet(myMoon, myData, myTime);
  if (orbitData.runOrbit) {
    myMoon.position.x = myMoon.position.x + myPlanet.position.x;
    myMoon.position.z = myMoon.position.z + myPlanet.position.z;
  }
}

// update function

function update(renderer, scene, camera, controls){
  pointLight.position.copy(sun.position);
  controls.update();
  var time = Date.now();
  movePlanet(earth, earthData, time);
  movePlanet(edo, edoData, time);
  movePlanet(ring, earthData, time, true);
  moveMoon(moon, earth, moonData, time);

  renderer.render(scene, camera);
  requestAnimationFrame(function(){
    update(renderer, scene, camera, controls)
  });

}

// initialize all

function init(){
  // create camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 30;
  camera.position.x = -30;
  camera.position.y = 30;
  camera.lookAt(new THREE.Vector3(0,0,0));
  // create scene
  scene = new THREE.Scene();
  // create renderer for animation control
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // attach the renderer to the display div
  document.getElementById('webgl').appendChild(renderer.domElement);
  // create controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // load the background images
  var path = 'cubemap/';
  var format = '.jpg';
  var urls = [
    path + 'px' + format,
    path + 'nx' + format,
    path + 'py' + format,
    path + 'ny' + format,
    path + 'pz' + format,
    path + 'nz' + format,
  ];
  var reflectionCube = new THREE.CubeTextureLoader().load(urls);
  reflectionCube.format = THREE.RGBFormat;
  // add background cube to scene
  scene.background = reflectionCube;
  // create light from the sun
  pointLight = getPointLight(1.5, "rgb(255,255,255)");
  scene.add(pointLight);
  // create some ambient light
  var ambientLight = new THREE.AmbientLight(0xAAAAAA);
  // scene.add(ambientLight);
  // create the sun
  var sunMaterial = getMaterial('basic', 'rgb(255,255,255)');
  sun = getSphere(sunMaterial,16,48);
  scene.add(sun);
  // create the glow of the sun
  var spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.ImageUtils.loadTexture("img/glow.png"),
    useScreenCoordinates: false,
    color: 0xFFFFEE,
    transparent:true,
    blending: THREE.AdditiveBlending
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(70,70,1.0);
  sun.add(sprite);
  // create all the element
  earth = loadTexturedPlanet(earthData, earthData.distanceFromAxis,0,0);
  edo = loadTexturedPlanet(edoData, edoData.distanceFromAxis,0,0);
  bool = loadTexturedPlanet(boolData, boolData.distanceFromAxis,0,0);
  moon = loadTexturedPlanet(moonData, moonData.distanceFromAxis,0,0);
  ring = getTube(3.03,0.05,20,320,0x757064,'ring',earthData.distanceFromAxis);
  // create visible orbit for earth
  createVisibleOrbits();
  // create GUI that display controls
  var gui = new dat.GUI();
  var folder1 = gui.addFolder('light');
  folder1.add(pointLight, 'intensity',0,10);
  var folder2 = gui.addFolder('speed');
  folder2.add(orbitData, 'value',0,500);
  folder2.add(orbitData, 'runOrbit',0,1);
  folder2.add(orbitData, 'runRotation',0,1);

  // start scene
  update(renderer, scene, camera, controls);

}
// start everything
init();



window.addEventListener("keydown", event => {
  // do something
  // if (event.keyCode == 39) {
  //   bool.rotation.y += 1;
  // }else if (event.keyCode == 37){
  //   bool.rotation.y -= 1;
  // }else if (event.keyCode == 38) {
  //   bool.rotation.x += 1;
  // }else if (event.keyCode == 40) {
  //   bool.rotation.x -= 1;
  // }
  switch (event.keyCode) {
    case 39:
      bool.rotation.y += 1;
      break;
    case 37:
      bool.rotation.y -= 1;
      break;
    case 38:
      bool.rotation.x += 1;
      break;
    case 40:
      bool.rotation.x -= 1;
      break;
    case 49:
    camera.position.y = 6.5;
    camera.position.x = 60;
    camera.position.z = 0;

      break;
    case 50:
    camera.position.z = 30;
    camera.position.x = -30;
    camera.position.y = 30;
      break;

    default:

  }
  console.log(event.keyCode);
});
var cam2BoxGeometry = new THREE.BoxGeometry(1,1,1);
var camBoxMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: false});
var cam2Box = new THREE.Mesh(cam2BoxGeometry,camBoxMaterial);
cam2Box.position.x = 60;
cam2Box.position.y = 6.5;
scene.add(cam2Box);
