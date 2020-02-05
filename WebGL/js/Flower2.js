/* GLOBAL VARIABLES */
var camera;
var scene;
var renderer;
var geometry;
var material;
var mesh;
var objLoader;
var strDownloadMime = "image/octet-stream";
var inter =0;
var click =0;
var selected ="nothing";
var cube1;
var cube2;
var watering;
var water;
var plantType;
var mouseX = 0, mouseY = 0;
var floor;
var cubeRotation = 50;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

//Statistics
var statistics = [["sunFlower3",0],["rose3",0],["mushroom3",0]];

//to save all plants and then calculate statistics
/*function makeStruct(names) {
    var names = names.split(' ');
    var count = names.length;
    function constructor() {
        for (var i = 0; i < count; i++) {
            this[names[i]] = arguments[i];
        }
    }
    return constructor;
}

var Item = makeStruct("kvet borntime");
var row = new Item("sunFlower", '25');
alert(row.borntime); // displays: 25*/

//time
var deltaTime;
var time;

//Raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var lastColoredObject = null;

var GUI_param =  {
    Name:'Control panel',
    Width_Count : 4,
    Height_Count : 4,
    Screenshoot : function () {
        saveAsImage();
    },
};

window.onload = function() {
    var gui = new dat.GUI();
    //var timer = time;
    gui.remember(GUI_param);
    gui.add(GUI_param, 'Name');
    gui.add(GUI_param, 'Width_Count', 1, 8).step(1).onChange( function () {
        updateFloor();
    } );
    gui.add(GUI_param, 'Height_Count', 1, 8).step(1).onChange( function () {
        updateFloor();
    } );
    gui.add(GUI_param,'Screenshoot');
    gui.open();
};

function updateFloor(){
    var sceneCount = scene.children.length;
    var k =0;
    do{
        var nam = scene.children[k];
        if(nam.userData.objectType === "floor" || nam.userData.objectType === "water" || nam.userData.objectType === "flower_planted" || nam.userData.objectType === "cube2"){
            scene.remove(nam);
            sceneCount--;
        }else{
            k++;
        }
    }
    while(k < sceneCount);
    for (var i = 0; i<GUI_param.Width_Count;i++){
        for (var j = 0; j<GUI_param.Height_Count;j++) {
            var widthx = 8000 / GUI_param.Width_Count;
            var widthz = 8000 / GUI_param.Height_Count;
            var posx = 4000 - (widthx / 2) - widthx * i;
            var posz = 4000 - (widthz / 2) - widthz * j;
            addFloor(posx, posz, widthx, widthz);
        }
    }
}

init();
render();

function addSkyBox() {
    var imagePrefix = "texture/sky2/";
    var directions = ["posx", "negx", "posy", "negy", "posz", "negz"];
    var imageSuffix = ".jpg";
    var skyGeometry = new THREE.CubeGeometry( 100000, 100000, 100000 );
    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] +
                imageSuffix ),
            side: THREE.BackSide
        }));
    //var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyMaterial = ( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, materialArray );
    skyBox.name = "skybox";
    skyBox.userData={ objectType: "skybox"};
    scene.add( skyBox );
}

function init() {
    scene = new THREE.Scene();
    addCamera();
    addLight();
    updateFloor();
    //addCube((-1000),3500,0); //skuska na rastliny hore
    addWatering((-4500),1000,0);    //konva
    addSkyBox();
    addPlants();
    renderer = new THREE.WebGLRenderer(
        {
            preserveDrawingBuffer: true
        }
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDrag(){
    for ( var j = 0; j <scene.children.length; j++ ) {
        var id = scene.children[j];
        //if (id.userData.objectType === "cube1")id.scale.x=id.scale.y=id.scale.z =1;
        if (id.userData.objectType === "plant")id.scale.x=id.scale.y=id.scale.z =1600;
    }
    /*if(click === 0) click =1; else {
        click = 0;
    }*/
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    onDrag();
    click =1;
}

function addWater(posX,posY,posZ,flowerId){
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var textureSurface = new THREE.TextureLoader().load('models/plants/water-drop.jpg');
    var material1 = new THREE.MeshStandardMaterial ( {color: "white", map:
        textureSurface	} );
    water = new THREE.Mesh( geometry, material1 );
    water.position.set(posX,posY,posZ);
    water.scale.x = water.scale.y = water.scale.z =2;
    water.name="water";
    water.userData={ flowerId: flowerId, objectType: "water"};
    scene.add( water );


 var loader = new THREE.OBJLoader();

 var material = new THREE.MeshPhongMaterial({color: "white", map:
     textureSurface });

 loader.load( 'models/plants/Can/CanOBJ.obj', function ( object ) {
     object.traverse( function ( node ) {
         object.position.set(posX,posY,posZ);
         object.material = material;
         object.scale.set(25,25,25);                         //nastavit scale
         object.name="water";
         object.userData={ flowerId: flowerId, objectType: "water"};
         //console.log("tu");
         if ( node.isMesh ) node.material = material;
     } );
     // Add the model to the scene.
     //scene.add( object );

     //scene.getObjectById((object.id+1)).userData ={objectType: "child"};
     //console.log("typ objektu z userdata, add "+object.userData.objectType+" id "+(object.id));
     //console.log(scene.getObjectById((object.id+1)).userData);
 });


}

function addWatering(posX,posY,posZ){
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var material1 = new THREE.MeshStandardMaterial ( {color: 0x42C0FB	} );
    watering = new THREE.Mesh( geometry, material1 );
    watering.position.set(posX,posY+1500,posZ);
    watering.name="watering";
    watering.scale.x = watering.scale.y = watering.scale.z =4;
    watering.userData={ objectType: "watering_test"};
    //scene.add( watering );


    var loader = new THREE.OBJLoader();
    var textureSurface = new THREE.TextureLoader().load('models/plants/Can/CanSpecular.jpg');
    var material = new THREE.MeshPhongMaterial({color: "blue", map:
        textureSurface });

    loader.load( 'models/plants/Can/CanOBJ.obj', function ( object ) {
        object.traverse( function ( node ) {
            object.position.set(posX,posY,posZ);
            object.material = material;
            object.scale.set(40,40,40);
            object.rotation.y = Math.PI;//nastavit scale
            object.name="watering";
            object.userData={ objectType: "watering"};
            //console.log("tu");
            if ( node.isMesh ) node.material = material;
        } );
        // Add the model to the scene.
        scene.add( object );
        scene.getObjectById((object.id+1)).userData ={objectType: "child"};
        //console.log("typ objektu z userdata, add "+object.userData.objectType+" id "+(object.id));
    });


}

function helpAddCube(type, count,posX,posY,posZ){
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var material = new THREE.MeshStandardMaterial ( {color: 0x42C0FB	} );
    cube1 = new THREE.Mesh( geometry, material );
    cube1.position.set(posX-(count*1000),posY,posZ);
    cube1.name="cube1";
    cube1.userData = { type: type, objectType: "cube1" };
    scene.add(cube1);
}

function addCube(posX,posY,posZ){
    helpAddCube("sunFlower1",0, posX,posY,posZ);
    helpAddCube("rose1",1,posX,posY,posZ);
    helpAddCube("mushroom1",2,posX,posY,posZ);
}

function addCube2(posX,posY,posZ,floorId, flowerType){
    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var material = new THREE.MeshStandardMaterial ( {color: 0x42C0FB	} );
    cube2 = new THREE.Mesh( geometry, material );
    cube2.position.set(posX,posY,posZ);
    cube2.name="cube2";
    cube2.scale.x=cube2.scale.y=cube2.scale.z=2;
    cube2.userData= { bornTime: time, growTime: 10, thirsty: false, type: flowerType, floorId: floorId, objectType: "cube2" };
    scene.add( cube2 );
}

function addCamera() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth
        / window.innerHeight, 1, 100000);
    camera.position.y = 3000;
    camera.position.z = -7000;
    camera.lookAt(new THREE.Vector3(50,800, 0));
}

function addLight() {
    var ambient = new THREE.AmbientLight( 0xffffff, 0.6 );
    ambient.userData = { objectType: "ambient" };
    scene.add( ambient );
    /*var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position = new THREE.Vector3(0, 10000, 0);
    pointLight.userData = { objectType: "pointLight" };
    scene.add(pointLight);*/
}

function addFloor(posX,posZ,width,height) {
    var floorTexture = new THREE.ImageUtils.loadTexture( "texture/grass.jpg" );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 1, 1 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide} );
    var floorGeometry = new THREE.PlaneGeometry(width, height, 10, 10);
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.position.x=posX;
    floor.position.z=posZ;
    floor.rotation.x = Math.PI / 2;
    floor.userData={ px: floor.position.x, pz: floor.position.z, empty: true, objectType: "floor" };
    floor.name="floor";
    scene.add(floor);
}

function addFlower(positX,positZ, floorId, flowerType) {
    var mtlLoader1 = new THREE.MTLLoader();
    mtlLoader1.setTexturePath('models/');
    mtlLoader1.setPath('models/plants/');
    var texture;
    var model;
    var scales;
    switch(flowerType){
        case "sunFlower1":
            model = "FlowerA_01";
            texture = "Flowers_03_BaseColor.png";
            scales=1400;
            break;
        case "sunFlower2":
            model = "FlowerA_03";
            texture = "Flowers_03_BaseColor.png";
            scales=1400;
            break;
        case "sunFlower3":
            model = "FlowerA_02";
            texture = "Flowers_03_BaseColor.png";
            scales=1400;
            break;
        case "rose1":
            model = "FlowerC_02";
            texture = "Flowers_01_BaseColor.png";
            scales=1200;
            break;
        case "rose2":
            model = "FlowerC_01";
            texture = "Flowers_01_BaseColor.png";
            scales=1200;
            break;
        case "rose3":
            model = "FlowerC_03";
            texture = "Flowers_01_BaseColor.png";
            scales=1200;
            break;
        case "mushroom1":
            model = "Mushroom_01_Base";
            texture = "Mushroom_03_basecolor.png";
            scales=400;
            break;
        case "mushroom2":
            model = "Mushroom_02_Base";
            texture = "Mushroom_03_basecolor.png";
            scales=400;
            break;
        case "mushroom3":
            model = "Mushroom_03_Base";
            texture = "Mushroom_03_basecolor.png";
            scales=400;
            break;
        default:
            model="Fern_01";
            scales=1400;
            break;
    }
    mtlLoader1.load(model+".mtl", function (materials) {
        materials.preload();
        objLoader = new THREE.OBJLoader();
        objLoader.setPath('models/plants/');
        objLoader.load(model+'.obj', function (flower) {
            flower.scale.x = flower.scale.y = flower.scale.z =scales;
            flower.position = new THREE.Vector3(500, 1000, 500);
            flower.position.x = positX-500;
            flower.position.z = positZ;
            flower.rotation.y = Math.PI / 2;
            flower.userData= { bornTime: time, growTime: 10, thirsty: false, type: flowerType, floorId: floorId, objectType: "flower_planted" };
            flower.name="flower1";
            //scene.add(flower);
        });
    });

    var loader = new THREE.OBJLoader();
    var textureSurface = new THREE.TextureLoader().load('models/plants/'+texture);
    var material = new THREE.MeshPhongMaterial({color: "white", map:
        textureSurface });

    loader.load('models/plants/'+model+'.obj', function ( object ) {
        object.traverse( function ( node ) {
            object.position.set(positX,0,positZ);
            object.material = material;
            object.scale.set(1400,1400,1400);
            object.rotation.y = Math.PI;
            object.userData= { bornTime: time, growTime: 10, thirsty: false, type: flowerType, floorId: floorId, objectType: "flower_planted" };
            object.name="flower";
            if ( node.isMesh ) node.material = material;

        } );

        scene.add( object );
        //scene.getObjectById((object.id+1)).userData = { bornTime: time, growTime: 10, thirsty: false, type: flowerType, floorId: floorId, objectType: "flower1" };
        scene.getObjectById((object.id+1)).userData ={objectType: "child"};
        //console.log("typ objektu z userdata, add "+object.userData.objectType+" id "+(object.id));
    });




}


function loadOBJects(x,y,z, path, scalex, scaley, scalez, texturePath, colorMaterial){
    //path cest k moedlu,
    // instantiate a loader
    var loader = new THREE.OBJLoader();
    //var normalmap_concrete = THREE.ImageUtils.loadTexture(normalPath);
    var textureSurface = new THREE.TextureLoader().load(texturePath);
    var material = new THREE.MeshPhongMaterial({color: colorMaterial, map:
        textureSurface });
// load a resource
    loader.load( path, function ( object ) {
        // For any meshes in the model, add our material.
        object.traverse( function ( node ) {
            object.position.set(x,y,z);
            object.material = material;
            object.scale.set(scalex,scaley,scalez);
            if ( node.isMesh ) node.material = material;
        } );
        // Add the model to the scene.
        scene.add( object );
    });
}


function addPlant(model, type, count){
    var mtlLoader1 = new THREE.MTLLoader();
    mtlLoader1.setTexturePath('models/');
    mtlLoader1.setPath('models/plants/');
    mtlLoader1.load(model+".mtl", function (materials) {
        materials.preload();
        objLoader = new THREE.OBJLoader();
        objLoader.setPath('models/plants/');
        objLoader.load(model+".obj", function (object) {
            object.scale.x = object.scale.y = object.scale.z = 1600;
            object.position.x = 3000-(count*1000);
            object.position.y = 3000;
            object.name = "plant";
            object.userData = {type: type, objectType: "plant" };
            //scene.add(object);

            //object.name="flower1";
        });
    });
    var texture;
    switch(type){
        case "sunFlower1":
            model = "FlowerA_01";
            texture = "Flowers_03_BaseColor.png";
            break;
        case "rose1":
            model = "FlowerC_02";
            texture = "Flowers_01_BaseColor.png";
            break;
        case "mushroom1":
            model = "Mushroom_01_Base";
            texture = "Mushroom_03_basecolor.png";
            break;
        default:
            model="Fern_01";
            break;
    }

    var loader = new THREE.OBJLoader();
    var textureSurface = new THREE.TextureLoader().load('models/plants/'+texture);
    var material = new THREE.MeshPhongMaterial({color: "white", map:
        textureSurface });

    loader.load('models/plants/'+model+'.obj', function ( object ) {
        object.traverse( function ( node ) {
            object.position.set(3000-(count*1000),3500,0);
            object.material = material;
            object.scale.set(1600,1600,1600);
            object.userData = {type: type, objectType: "plant" };
            object.rotation.y = Math.PI;
            object.name="plant";
            if ( node.isMesh ) node.material = material;
        } );
        //object.name="flower1";
        scene.add( object );
        scene.getObjectById((object.id+1)).userData ={objectType: "child"};
        //scene.getObjectById(object.id).name = "flower1";
    });


}

function addPlantlow(model, type, count){
    var mtlLoader1 = new THREE.MTLLoader();
    mtlLoader1.setTexturePath('models/');
    mtlLoader1.setPath('models/plants/');
    mtlLoader1.load(model+".mtl", function (materials) {
        materials.preload();
        objLoader = new THREE.OBJLoader();
        objLoader.setPath('models/plants/');
        objLoader.load(model+".obj", function (object) {
            object.scale.x = object.scale.y = object.scale.z = 200;
            object.position.x = 3000-(count*1000);
            object.position.y = 3000;
            object.name = "plant";
            object.userData = {type: type};
            scene.add(object);
            //object.name="flower1";
        });
    });
}


function addPlants() {
    //for(var pl=0; pl<2;pl++){
    addPlant("FlowerA_01","sunFlower1",0);
    addPlant("FlowerC_02","rose1",1);
    addPlant("Mushroom_01_Base","mushroom1",2);

    //addPlantlow("lowpolytree","abc",3);
    //}
}

var then = 0;
function render(now) {

    now *= 0.001;
    time = now;
    deltaTime = now - then;
    then = now;
    requestAnimationFrame(render);

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    for ( var k = 0; k <scene.children.length; k++ ) {
        var nam = scene.children[k];


        if (nam.userData.objectType === "flower_planted"){
            //console.log(nam.userData.objectType);
            if((nam.userData.bornTime+nam.userData.growTime)<time && nam.userData.thirsty === false){       //NECHAT
                addWater(nam.position.x,1500,nam.position.z,nam.id);

                nam.userData.thirsty = true;
            }
        }


        if (nam.userData.objectType === "water"){
            //console.log(nam.userData.objectType);
        nam.rotation.y = cubeRotation;
            //console.log(cubeRotation);
        }


        /*if (nam.userData.objectType === "cube2"){                                                                          //TESTOVACIE UCELY

            if((nam.userData.bornTime+nam.userData.growTime)<time && nam.userData.thirsty === false){
                addWater(nam.position.x,2000,nam.position.z,nam.id);
                nam.userData.thirsty = true;

            }
        }*/

    }

    inter = intersects.length;

    for ( var sky = 0; sky <scene.children.length; sky++ ) {
        var skybox = scene.children[sky];
        if (skybox.userData.objectType === "skybox")inter--;
    }
    if (inter === 0 && click === 1) {
        click =0;

        for ( var fu = 0; fu <scene.children.length; fu++ ) {
            var fum = scene.children[fu];
            //console.log("typ objektu z userdata "+fum.userData.objectType);
            //console.log("\n");
        }

    }
    if (inter > 0 && click === 1) {
        //console.log("intersect count: "+inter+" \n names: ");
        for (var dig = 0; dig<inter;dig++){
            //console.log("pomcona"+intersects[dig].object.userData.objectType);
          /*if(intersects[dig].object.parent.userData.objectType){
              console.log(intersects[dig].object.parent.userData.objectType+" id "+intersects[dig].object.parent.id);
          }else {
              console.log(intersects[dig].object.userData.objectType+" id "+intersects[dig].object.id);
          }*/



        }
        //console.log("\n");
        //if(intersects[0].object.parent.userData.objectType === "flower_planted"){console.log("grow");}
        //if( intersects[0].object.userData.objectType === "floor")//console.log(intersects[0].object.userData.empty);
            /*if(selected === "cube1" && intersects[0].object.userData.objectType === "floor" && intersects[0].object.userData.empty){
                addFlower(intersects[0].object.userData.px,intersects[0].object.userData.pz,intersects[0].object.id, plantType);
                intersects[0].object.userData.empty = false;
                //addCube2(intersects[0].object.userData.px,0,intersects[0].object.userData.pz,intersects[0].object.id, plantType);       //testovanie
            }*/

        if(selected === "plant" && intersects[0].object.userData.objectType === "floor" && intersects[0].object.userData.empty){
            addFlower(intersects[0].object.userData.px,intersects[0].object.userData.pz,intersects[0].object.id, plantType);
            intersects[0].object.userData.empty = false;
            //addCube2(intersects[0].object.userData.px,0,intersects[0].object.userData.pz,intersects[0].object.id, plantType);       //testovanie
        }


        //console.log("typ objektu z userdata "+nam.userData.objectType);
        //if(selected === "watering_test" && intersects[0].object.parent.userData.objectType === "flower_planted" && intersects[0].object.parent.userData.thirsty){

        if(selected === "watering" && intersects[0].object.parent.userData.objectType === "flower_planted" && intersects[0].object.parent.userData.thirsty){  //NECHAT WATERING

        //if(selected === "watering_test" && intersects[0].object.userData.objectType === "cube2" && intersects[0].object.userData.thirsty){  //poloha rastlinky testovacie ucely, normalne samotna rastlina
                 //NECHAT
            console.log("grow up");
            for ( var l = 0; l <scene.children.length; l++ ) {
                var child = scene.children[l];
                if(child.userData.objectType === "water" && child.userData.flowerId === intersects[0].object.parent.id){//TESTOVACIE UCELY
                    scene.remove(child);    //odstrani vodu nad rastlinou
                }

            }

            /*var sceneCount = scene.children.length;
            var l =0;
            do{
                var na = scene.children[l];
                if(na.userData.objectType === "floor" || na.userData.objectType === "water" || na.userData.objectType === "flower_planted" || na.userData.objectType === "cube2"){
                    scene.remove(na);
                    sceneCount--;
                }else{
                    k++;
                }
            }
            while(l < sceneCount);*/


            var flotyp = intersects[0].object.parent.userData.type;
            var flopar = [intersects[0].object.parent.position.x, intersects[0].object.parent.position.z, intersects[0].object.parent.userData.floorId];

            /*if(flotyp === "sunFlower3"){        //free floor
                scene.getObjectById(flopar[2]).userData.empty=true;
            }*/
            scene.remove(scene.getObjectById(intersects[0].object.parent.id)); //remove plant/cube2
            switch(flotyp){
                case"sunFlower1":
                    addFlower(flopar[0],flopar[1],flopar[2],"sunFlower2");
                    //addCube2(flopar[0]-200,0,flopar[1],flopar[2],"sunFlower2"); //testovanie
                    break;
                case "sunFlower2":
                    addFlower(flopar[0],flopar[1],flopar[2], "sunFlower3");
                    //addCube2(flopar[0]-500,0,flopar[1],flopar[2],"sunFlower3");    //testovanie
                    break;
                case"rose1":
                    addFlower(flopar[0],flopar[1],flopar[2],"rose2");
                    //addCube2(flopar[0]-200,0,flopar[1],flopar[2],"rose2"); //testovanie
                    break;
                case "rose2":
                    addFlower(flopar[0],flopar[1],flopar[2], "rose3");
                    //addCube2(flopar[0]-500,0,flopar[1],flopar[2],"rose3");    //testovanie
                    break;
                case"mushroom1":
                    addFlower(flopar[0],flopar[1],flopar[2],"mushroom2");
                    //addCube2(flopar[0]-200,0,flopar[1],flopar[2],"mushroom2"); //testovanie
                    break;
                case "mushroom2":
                    addFlower(flopar[0],flopar[1],flopar[2], "mushroom3");
                    //addCube2(flopar[0]-500,0,flopar[1],flopar[2],"mushroom3");    //testovanie
                    break;
                default:
                    for (var m=0; m < statistics.length; m++) {                                 //statistika pripadny presun
                        if (statistics[m][0]=== flotyp) statistics[m][1]++;
                        scene.getObjectById(flopar[2]).userData.empty=true; //free floor
                        //console.log(statistics[m][1]);
                    }
            }
        }
        var typos;
        if(intersects[0].object.userData.objectType === "child") typos = intersects[0].object.parent.userData.objectType;
        else typos = intersects[0].object.userData.objectType;
        //console.log("typos parent: "+intersects[0].object.parent.userData.objectType);
        switch(typos){
            /*case "cube1":                                                                               //TESTOVANIE PREROBIT NA plant
                intersects[0].object.scale.x=intersects[0].object.scale.y=intersects[0].object.scale.z =4;
                selected="cube1";
                plantType = intersects[0].object.userData.type;   //rozsirenie na viac rastlin
                break;*/
            case "plant":                                                                               //TESTOVANIE PREROBIT NA plant
                intersects[0].object.parent.scale.x=intersects[0].object.parent.scale.y=intersects[0].object.parent.scale.z =2000;
                selected="plant";
                plantType = intersects[0].object.parent.userData.type;   //rozsirenie na viac rastlin
                break;
            case "watering_test":
                selected = "watering_test";
                break;
            case "watering":
                selected = "watering";
                break;
            /*default:
                selected="nothing";
                break;*/
        }
        //console.log("typos after: "+typos);
        click = 0;

    }

    /*if (inter > 0 ) {
        if (lastColoredObject  ) lastColoredObject.material.color.set("white");
        lastColoredObject = intersects[0].object;
        lastColoredObject.material.color.set("red");
    }
    if (intersects.length === 0 && lastColoredObject ) {
        lastColoredObject.material.color.set("white");
    }*/



    cubeRotation = cubeRotation + 0.01;
    renderer.render(scene, camera);
}

function saveAsImage() {
    var imgData, imgNode;

    try {
        var strMime = "image/jpeg";
        imgData = renderer.domElement.toDataURL(strMime);

        saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

    } catch (e) {
        console.log(e);
        return;
    }

}

var saveFile = function (strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
};