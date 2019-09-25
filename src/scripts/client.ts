import { IJournal, EventEnum } from '../IJournal';
import { Star, StarRepository } from './starRepository';
const starRepository = new StarRepository();

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import socketio from 'socket.io-client';
const socket = socketio();


// Sagitarius A*
const galaxyOverviewElement = document.getElementById( "galaxy-overview" );
const galaxyOverviewRenderer = new THREE.WebGLRenderer( { antialias: true } );
galaxyOverviewRenderer.setPixelRatio( window.devicePixelRatio );
galaxyOverviewRenderer.setSize( galaxyOverviewElement.clientWidth, galaxyOverviewElement.clientHeight );
galaxyOverviewElement.appendChild( galaxyOverviewRenderer.domElement );

const galaxyOverviewCamera = new THREE.PerspectiveCamera( 90, galaxyOverviewElement.clientWidth / galaxyOverviewElement.clientHeight, 0.1, 100000 );
galaxyOverviewCamera.position.set( 25.21875, -50000, 25899.96875 );
galaxyOverviewCamera.lookAt( 25.21875, -20.90625, 25899.96875 ); // Sagitarius A*

function onGalaxyOverviewResize() {
    galaxyOverviewCamera.aspect = galaxyOverviewElement.clientWidth / galaxyOverviewElement.clientHeight;
    galaxyOverviewCamera.updateProjectionMatrix();
    galaxyOverviewRenderer.setSize( galaxyOverviewElement.clientWidth, galaxyOverviewElement.clientHeight );
}
// /Sagitarius A*


// Sol
const solZoomElement = document.getElementById( "sol-zoom" );
const solZoomAnnotationTextElement = document.getElementById( "sol-zoom-annotation-text" );
const solZoomRenderer = new THREE.WebGLRenderer( { antialias: true } );
solZoomRenderer.setPixelRatio( window.devicePixelRatio );
solZoomRenderer.setSize( solZoomElement.clientWidth, solZoomElement.clientHeight );
solZoomElement.appendChild( solZoomRenderer.domElement );

const solZoomCamera = new THREE.PerspectiveCamera( 90, solZoomElement.clientWidth / solZoomElement.clientHeight, 0.1, 100000 );
solZoomCamera.position.set( 0, -100, 0 );
solZoomCamera.lookAt( 0, 0, 0 ); // Sol

const solZoomControls = new OrbitControls(solZoomCamera, solZoomElement);
solZoomControls.update();

function onSolZoomResize() {
    solZoomCamera.aspect = solZoomElement.clientWidth / solZoomElement.clientHeight;
    solZoomCamera.updateProjectionMatrix();
    solZoomRenderer.setSize( solZoomElement.clientWidth, solZoomElement.clientHeight );
}
// /Sol


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove( event: MouseEvent ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.offsetX / solZoomElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.offsetY / solZoomElement.clientHeight ) * 2 + 1;
}

solZoomElement.addEventListener( 'mousemove', onMouseMove, false );

function onClick( event: MouseEvent ) {
    selectStar(highlightedStar);
}

solZoomElement.addEventListener( 'click', onClick, false );


// Sol rotating
const solRotatingElement = document.getElementById( "sol-rotating" );
const solRotatingAnnotationTextElement = document.getElementById( "sol-rotating-annotation-text" );
const solRotatingRenderer = new THREE.WebGLRenderer( { antialias: true } );
solRotatingRenderer.setPixelRatio( window.devicePixelRatio );
solRotatingRenderer.setSize( solRotatingElement.clientWidth, solRotatingElement.clientHeight );
solRotatingElement.appendChild( solRotatingRenderer.domElement );

const solRotatingCamera = new THREE.PerspectiveCamera( 50, solRotatingElement.clientWidth / solRotatingElement.clientHeight, 0.1, 1000 );
solRotatingCamera.position.set( 0, 0, 0 );
solRotatingCamera.up.set(0, -1, 0);
solRotatingCamera.lookAt( 25.21875, -20.90625, 25899.96875 ); // Sagitarius A*

function onSolRotatingResize() {
    solRotatingCamera.aspect = solRotatingElement.clientWidth / solRotatingElement.clientHeight;
    solRotatingCamera.updateProjectionMatrix();
    solRotatingRenderer.setSize( solRotatingElement.clientWidth, solRotatingElement.clientHeight );
}
// /Sol rotating


function onWindowResize() {
    onGalaxyOverviewResize();
    onSolZoomResize();
    onSolRotatingResize();
}

window.addEventListener( 'resize', onWindowResize, false );


const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

const ambiLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambiLight );

const light = new THREE.PointLight();
light.position.set( 1025.21875, -50000, 45899.96875 );
scene.add( light );

const materials: { [event: string]: THREE.PointsMaterial } = {
    [EventEnum.FSDJump]: new THREE.PointsMaterial( { color: 0xffff00, size: 100 } ),
    [EventEnum.Location]: new THREE.PointsMaterial( { color: 0x0000ff, size: 100 } ),
    [EventEnum.Docked]: new THREE.PointsMaterial( { color: 0x00ff00, size: 100 } )
};

const gridHelper = new THREE.GridHelper( 200000, 20 );
scene.add( gridHelper );


// StarField
//const starGeometry = new THREE.OctahedronBufferGeometry( 1, 2 );
const starGeometry = new THREE.SphereBufferGeometry(1, 32, 16)
const starMaterial = new THREE.MeshStandardMaterial( { color: 0xfff291, metalness: 0.2, roughness: 0.8 } );
const starField = new THREE.Group();
scene.add( starField );
// /StarField


socket.on('journal', function(journal: IJournal) {
    if (journal.event === EventEnum.Scan) return;

    if (starRepository.add(journal)) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.name = journal.starSystem;
        star.position.set(journal.starPos[0], journal.starPos[1], journal.starPos[2]);
        starField.add( star );
    }

    const journalAge = new Date().valueOf() - new Date(journal.timestamp).valueOf();
    if (journalAge > 60 * 60 * 1000) { 
        console.log(`Skipped due to age: ${journalAge / 1000} secs.`);
        return;
    }

    console.log(journal);

    // const geometry = new THREE.Geometry();
    // geometry.vertices.push(new THREE.Vector3(journal.starPos[0], journal.starPos[1], journal.starPos[2]));

    // const points = new THREE.Points( geometry, materials[journal.event] );

    // scene.add( points );
});

let highlightedStar: THREE.Object3D = null;
function highlightStar(star: THREE.Object3D) {
    if (highlightedStar) {
        highlightedStar.scale.set(1, 1, 1);
    }

    if (star) {
        console.log(`Hit on '${star.name}' pos. ${star.position.toArray()}`);
        highlightedStar = star;
        highlightedStar.scale.set(1.5, 1.5, 1.5);
        solZoomAnnotationTextElement.innerText = star.name;
    } else {
        highlightedStar = null;
        solZoomAnnotationTextElement.innerText = "";
    }
}

let selectedStar: THREE.Object3D = null;
function selectStar(star: THREE.Object3D) {
    if (!star) return;
    solRotatingCamera.position.fromArray(star.position.toArray());
    solRotatingAnnotationTextElement.innerText = `View from '${star.name}'`;
}

function animate() {
    requestAnimationFrame( animate );

    raycaster.setFromCamera( mouse, solZoomCamera );
    const starIntersections = raycaster.intersectObjects( starField.children );
    if (starIntersections && starIntersections.length > 0) {
        const starIntersection = starIntersections[0];        
        highlightStar(starIntersection.object);
    } else {
        highlightStar(null);
    }

    solRotatingCamera.rotateY( -2*Math.PI / (30 * 60) );

    galaxyOverviewRenderer.render( scene, galaxyOverviewCamera );

    solZoomControls.update();
    solZoomRenderer.render( scene, solZoomCamera );
    
    solRotatingRenderer.render( scene, solRotatingCamera );
}
animate();