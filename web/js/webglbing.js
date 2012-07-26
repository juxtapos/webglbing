var LAT = 49.2936,
    LONG = 8.6418,
    ZOOM = 12;

var camerapos = new CameraPos(),
    scene, 
    camera, 
    renderer;

window.addEventListener('load', init, false)

function init () {

    var lat = 49;
    var long = 8;
    var zoom = 3;

    var p = TileSystem.latLongToPixelXY(lat, long, zoom);
    console.log(p);
    var tile = TileSystem.pixelXYToTileXY(p.pixelX, p.pixelY);
    console.log(tile);
    var qk = TileSystem.tileXYToQuadKey(tile.tileX, tile.tileY, zoom);
    console.log(qk);
    return;



    createGui();    
    loadScene();
    animate();
}

function CameraPos() {
  this.x = -400;
  this.y = 1200;
  this.z = 600;
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
    function cam() {
        camera.position.set(text.x, text.y, text.z);
        camera.lookAt(scene.position);   
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



    var p = TileSystem.latLongToPixelXY(LAT, LONG, ZOOM),
        neighbours = 7,
        rows = 2 * neighbours + 1,
        cols = 2 * neighbours + 1,
        cnt = rows * cols;

    for (var row = 1; row <= rows; row++) {
        for (var col = 1; col <= cols; col++ ) {
            //console.log('col='+col+',row='+row);
            var offsetX = (-cols+col) + neighbours;
            var offsetY = (-rows+row) + neighbours;

            x_ = p.pixelX + (256 * offsetX);
            y_ = p.pixelY + (256 * offsetY);
            var p_ = TileSystem.pixelXYToLatLong(x_, y_, ZOOM);
            lat = p_.latitude;
            long = p_.longitude;

            url = '/bing?centerX=' + long + '&centerY=' + lat + '&zoom=' + ZOOM + '&mapsizeX=256&mapsizeY=256';
            // floor: mesh to receive shadows
            var floorTexture = new THREE.ImageUtils.loadTexture(url);
            //floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
            //floorTexture.repeat.set( 10, 10 );
            // Note the change to Lambert material.
            var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture } ),
                floorGeometry = new THREE.PlaneGeometry(256, 256, 1, 1),
                floor = new THREE.Mesh(floorGeometry, floorMaterial),
                pos = { 
                    x: 0 + offsetX * 256, 
                    y: 0,
                    z: 0 + offsetY * 256
                };
            floor.position.set(pos.x, pos.y, pos.z);
            floor.doubleSided = true;
            // Note the mesh is flagged to receive shadows
            floor.receiveShadow = true;
            scene.add(floor);
        }
    };
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {   
    renderer.render( scene, camera );
}