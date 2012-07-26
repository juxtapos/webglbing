var lat = 49.2936;
var long = 8.6418;
var zoom = 12;
var neighbours = 3;

// duisburg
var lat = 51.4314308166504;
var long = 6.76392984390259;

var camerapos = new CameraPos(),
    scene, 
    camera, 
    renderer;

window.addEventListener('load', init, false)

function init () {
    createGui();    
    loadScene();
    animate();
}

function matrix(lat, long, zoom, neighbours) {
    var p = TileSystem.latLongToPixelXY(lat, long, zoom);
    var tile = TileSystem.pixelXYToTileXY(p.pixelX, p.pixelY);
    var tiles = [];
    var tx = Math.floor(tile.tileX);
    var ty = Math.floor(tile.tileY);
    for (var y = -neighbours; y < neighbours + 1; y++) {
        var yts = [];
        tiles.push(yts);
        for (var x = -neighbours; x < neighbours + 1; x++) {
            var tx_ = tx + x;
            var ty_ = ty + y;
            var quadkey = TileSystem.tileXYToQuadKey(tx_, ty_, zoom);
            yts.push(quadkey);
            //console.log(tx_+','+ty_+','+quadkey);
        }

    }
    return tiles;
}


function CameraPos() {
  this.x = -400;
  this.y = 1200;
  this.z = 600;
  this.zoom = zoom;
}

function createGui () {
    var text = camerapos;
    var gui = new dat.GUI();
    var c = gui.add(text, 'x', -500, 500).step(1);
    c.onChange(cam);
    var c = gui.add(text, 'y', 0, 4000).step(1);
    c.onChange(cam);
    var c = gui.add(text, 'z', -500, 500).step(1);
    c.onChange(cam);
    var c = gui.add(text, 'zoom', 1, 25).step(1);
    c.onChange(cam);

    var lastZoom = zoom;

    function cam() {
        camera.position.set(text.x, text.y, text.z);
        camera.lookAt(scene.position);   
        if (lastZoom != camerapos.zoom) {

        }
    }
}    

function loadScene() {
    var world = document.getElementById('world'),
        WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight,
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;


    scene = new THREE.Scene();

    // 
    // Create and set up lights
    // 
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(camerapos.x, camerapos.y, camerapos.z);
    camera.lookAt(scene.position);    
    scene.add(camera);

    // 
    // Create renderer
    // 
    renderer = new THREE.WebGLRenderer( { antialias: true} );
    renderer.setSize(WIDTH, HEIGHT);
    world.appendChild(renderer.domElement);
    renderer.shadowMapEnabled = true;

    // 
    // Create lights
    // 
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.set(CameraPos.x, CameraPos.y, CameraPos.z);
    pointLight.intensity = 100;
    scene.add(pointLight); 

    var dl = new THREE.DirectionalLight(0xff0000);
    dl.position.set(210, 200, 20).normalize();
    dl.intensity = 10;
    dl.castShadow = true;
    scene.add(dl);

    // spotlight #1 -- yellow, dark shadow
    // var spotlight = new THREE.SpotLight(0xffff00);
    // sotlight.position.set(-60,550,-30);
    // //spotlight.shadowCameraVisible = true;
    // spotlight.shadowDarkness = 0.95;
    // spotlight.intensity = 0.1;
    // // must enable shadow casting ability for the light
    // spotlight.castShadow = true;
    // scene.add(spotlight);


    
    //
    // Cube
    //
    var cubeMaterialArray = [];
    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x333333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x444444 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x444444 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x333333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x333333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x333333 } ) );
    // Cube parameters: width (x), height (y), depth (z), 
    //        (optional) segments along x, segments along y, segments along z, materials array
    var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1, cubeMaterialArray );
    // using THREE.MeshFaceMaterial() in the constructor below
    //   causes the mesh to use the materials stored in the geometry
    cube = new THREE.Mesh( cubeGeometry, new THREE.MeshFaceMaterial() );
    cube.position.set(400, 0, 180);
    cube.castShadow = true;
    scene.add( cube );

    var m = matrix(lat, long, zoom, neighbours);

    var flags = 'A'; // aerial
    var flags = 'A,G'; // aerial + roads + borders
    var flags = 'A,G,L'; // aerial + roads + borders + labels

    var flags = 'G'; // roads + borders 
    var flags = 'G,LA';
    var flags = 'G,VE,BX,LA'; // roads + borders + labels

    var ground = new THREE.Object3D();

    for (var y = 0; y < m.length; y++) {
        for (var x = 0; x < m.length; x++) {
            var qkey = m[y][x];
            var url = '/comp?quadkey=' + qkey + '&flags=' + flags;
            var obj = createTile(qkey, url);
            var px = 0 + (-neighbours) + x;
            var py = 0 + (-neighbours) + y;
            px = px * 256;
            py = py * 256;
            obj.position.set(px, 0, py);
            ground.add(obj);
            YY = obj;
        }
    }

    scene.add(ground);
}

var YY = null;

function createTile (quadkey, url) { 
    // floor: mesh to receive shadows
    var floorTexture = new THREE.ImageUtils.loadTexture(url);
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture } );
    var floorGeometry = new THREE.PlaneGeometry(256, 256, 1, 1);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.doubleSided = true;
    // Note the mesh is flagged to receive shadows
    floor.receiveShadow = true;
    return floor;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {   
    renderer.render( scene, camera );
}