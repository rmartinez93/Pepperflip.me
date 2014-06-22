var camera, scene, renderer, projector, mouse;
var pepper, pepperMaterial, empty, pepperTop, shaker;
var successMessage 	= "You got it!";
var headMessage 		= "It landed on its head!";
var failureMessage 	= "Sorry, you didn't make the flip.";
var rising = falling = bouncing = false;
var speed = weight = gravity = deceleration = acceleration = 0;
var bounceMode = score = 0;
var objects;
var ready = false;
var share = '';
init();

//window.addEventListener( 'resize', onWindowResize, false );

//function onWindowResize() {
//		camera.aspect = window.innerWidth / window.innerHeight;
//		camera.updateProjectionMatrix();
//		renderer.setSize( window.innerWidth, window.innerHeight ); 
//}

function init() {
		mouse = new THREE.Vector2();
		projector = new THREE.Projector();
		objects = [];
	
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 500;
		scene = new THREE.Scene();

		addBackground();
		addTable();
		prepareShaker();
		addShaker();
	
		var date = new Date();
		//if(localStorage.lastPepperflip != date.getDay())
				ready = true;
//		else {
//				$('header').html('You Already Flipped Today!');
//				$('#userScore').html(localStorage.lastPepperflipScore);
//		}
		animate();
}

function addBackground() {
		var backgroundPlane = new THREE.PlaneGeometry(window.innerWidth*2, window.innerHeight*100);
		var backgroundTexture = new THREE.ImageUtils.loadTexture('textures/clouds.jpg');
		backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
		backgroundTexture.repeat.set(2,300);
		backgroundTexture.anistropy = renderer.getMaxAnisotropy();
		var backgroundMaterial = new THREE.MeshBasicMaterial( {map: backgroundTexture } );
		var background = new THREE.Mesh( backgroundPlane, backgroundMaterial );
		background.position.z = -200;
		scene.add(background);
}

function addTable() {
		var tableCube = new THREE.BoxGeometry( 1800, 100, 500 );
		var tableTexture = THREE.ImageUtils.loadTexture( 'textures/wood.jpg' );
		tableTexture.anisotropy = renderer.getMaxAnisotropy();
		var tableMaterial = new THREE.MeshBasicMaterial( { map: tableTexture } );
		var table = new THREE.Mesh( tableCube, tableMaterial );
		table.position.y = -235;
		scene.add(table);
}

function prepareShaker() {
		//create pepper shaker material
		var pepperTexture = THREE.ImageUtils.loadTexture( 'textures/pepper.jpg' );
		pepperTexture.wrapS = pepperTexture.wrapT = THREE.RepeatWrapping;
		pepperTexture.repeat.set(2,2);
		pepperTexture.anisotropy = renderer.getMaxAnisotropy();
		pepperMaterial = new THREE.MeshBasicMaterial( { map: pepperTexture } );
	
		//create pepper shaker top
		var topCylinder = new THREE.CylinderGeometry(70, 85, 60, 50, 50, false);
		var topTexture = THREE.ImageUtils.loadTexture( 'textures/chrome.jpg' );
		topTexture.anisotropy = renderer.getMaxAnisotropy();
		var topMaterial = new THREE.MeshBasicMaterial( { map: topTexture } );
		pepperTop = new THREE.Mesh( topCylinder, topMaterial );
		pepperTop.position.y = 150;
	
		//create empty space material
		var emptyCylinder = new THREE.CylinderGeometry(85, 125, 250, 50, 50, false);
		var emptyMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3 } );
		empty = new THREE.Mesh( emptyCylinder, emptyMaterial );
	
		objects.push(pepperTop);
		objects.push(empty);
}

function addShaker() {
		if(shaker) scene.remove(shaker);
		shaker = new THREE.Object3D();

		var rand 					= Math.random();
		var radBottom 		= 120;
		var radTop 				= radBottom - Math.floor(40*rand);
		var radSeg				= 50;
		var height 				= Math.floor(240*rand);
		var heightSeg 		= 50;
		weight 						= 0.05*rand;
		pepperCylinder 		= new THREE.CylinderGeometry(radTop, radBottom, height, radSeg, heightSeg, false);
		pepper 						= new THREE.Mesh( pepperCylinder, pepperMaterial );
		pepper.position.y = -120 + height/2;

		//combine parts
		shaker.add(pepper);
		shaker.add(empty);
		shaker.add(pepperTop);
		shaker.rotation.y = 1;
		scene.add(shaker);
	
		objects.push(empty);
}
            
function animate() {
		requestAnimationFrame( animate );
		if(rising) 				rise();
		else if(falling) 	fall();
		else if(bouncing) bounce();
		renderer.render( scene, camera );
}

function rise() {
		gravity *= deceleration;
		shaker.rotation.x += 0.2;
		shaker.position.y += (speed - gravity)*0.01;
		camera.position.y += (speed - gravity)*0.01;
		updateScore(score+=10);
		if(speed < gravity) {
				rising 	= false;
				falling = true;
		}
}

function fall() {
		gravity *= acceleration;
		shaker.rotation.x += 0.1;
		shaker.position.y -= (speed-gravity)*0.01; 
		camera.position.y -= (speed-gravity)*0.01;
		
		if(shaker.position.y-50 <= 0) {
				falling = false;
				shaker.rotation.x = Math.round(shaker.rotation.x%6.3 * 10) / 10;
				shaker.position.y = 0;
				camera.position.y = 0;
				bouncing = true;
		}
}

function bounce() {
		if(!bounceMode) {
				if			(shaker.rotation.x >= 0 	&& shaker.rotation.x <  0.4) 	bounceMode = 1;
				else if (shaker.rotation.x >= 0.4 && shaker.rotation.x <  1.6) 	bounceMode = 2;
				else if (shaker.rotation.x >= 1.6 && shaker.rotation.x <  2.7) 	bounceMode = 3;
				else if (shaker.rotation.x >= 2.7 && shaker.rotation.x <  3.1) 	bounceMode = 4;
				else if (shaker.rotation.x >= 3.1 && shaker.rotation.x <  3.5) 	bounceMode = 5;
				else if (shaker.rotation.x >= 3.5 && shaker.rotation.x <  4.7)	bounceMode = 6;
				else if (shaker.rotation.x >= 4.7 && shaker.rotation.x <  5.9) 	bounceMode = 7;
				else if (shaker.rotation.x >= 5.9 && shaker.rotation.x <= 6.3)	bounceMode = 8;
		}
		switch(bounceMode) {
				case 1:
						if(shaker.rotation.x > 0)
								shaker.rotation.x -= 0.1;
						else {
								popover(true, successMessage);
								updateScore(score+1000);
						}
						break;
				case 2:
						if(shaker.rotation.x < 1.6) 
								shaker.rotation.x += 0.1;
						else {
								shaker.position.y = - 25;
								popover(false, failureMessage);
						}
						break;
				case 3:
						if(shaker.rotation.x > 1.6) 
								shaker.rotation.x -= 0.1;
						else {
								shaker.position.y = - 50;
								popover(false, failureMessage);
						}
						break;
				case 4:
						if(shaker.rotation.x < 3.1) 
								shaker.rotation.x += 0.1;
						else {
								popover(false, headMessage);
								updateScore(score-1000);
						}
						break;
				case 5:
						if(shaker.rotation.x > 3.1) 
								shaker.rotation.x -= 0.1;
						else {
								popover(false, headMessage);
								updateScore(score-1000);
						}
						break;
				case 6:
						if(shaker.rotation.x < 4.7) 
								shaker.rotation.x += 0.1;
						else {
								popover(false, failureMessage);
						}
						break;
				case 7:
						if(shaker.rotation.x > 4.7) 
								shaker.rotation.x -= 0.1;
						else {
								popover(false, failureMessage);
						}
						break;
				case 8:
						if(shaker.rotation.x < 6.3) 
								shaker.rotation.x += 0.1;
						else {
								popover(true, successMessage);
								updateScore(score+1000);
						}
						break;
		}
}

$('canvas').attr('id','canvas');
Hammer(document.getElementById('canvas')).on('drag', function(event) {
		event.gesture.preventDefault();
		if(ready) {
				console.log(event);
				mouse.x = ( event.gesture.startEvent.center.pageX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.gesture.startEvent.center.pageY / window.innerHeight ) * 2 + 1;
				var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
				projector.unprojectVector( vector, camera );

				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

				var intersects = raycaster.intersectObjects( objects );

				if(intersects.length > 0) {
						ready = false;
						if((event.gesture.distance)/event.gesture.deltaTime > 0.05) {
								gravity = 1;
								deceleration = 1.05+weight;
								acceleration = 1/deceleration;
								speed = 3000*((event.gesture.distance)/event.gesture.deltaTime);
								rising = true;
								$('header').html('Flipping!');
						}
						else popover(false, 'Pull faster!');
				}
		}
//})
//.on('tap', function(event) {
//		event.gesture.preventDefault();
//	
//		mouse.x = ( event.gesture.center.pageX / window.innerWidth ) * 2 - 1;
//		mouse.y = - ( event.gesture.center.pageY / window.innerHeight ) * 2 + 1;
//		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
//		projector.unprojectVector( vector, camera );
//
//		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
//
//		var intersects = raycaster.intersectObjects( objects );
//
//		if ( intersects.length > 0 ) {
//				intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
//		}
});

function popover(success, message) {
		bouncing = false;
		var color = success ? '#2ecc71' : '#c0392b';
		var share = success ? 'I just made a '+score+' point Pepperflip!' : 'I missed my Pepperflip! Think you can beat me?';
		$('#score').css('background', color).html(message).slideDown();
		$('header').hide();
		$('button').removeClass('hideImportant');
		$('button').attr('onclick', 'share('+share+')');
		localStorage.lastPepperflip = new Date().getDay();
		localStorage.lastPepperflipScore = score;
}

function share(message) {
		window.plugins.socialsharing.share(message, null, null, 'http://www.google.com');
}

function resetGame(){
		var date = new Date();
		if(localStorage.lastPepperflip != date.getDay()) {
				$('header').show();
				$('header').html('Flip Shaker to Pepperflip...');
				$('button').addClass('hideImportant');
				$('#score').hide(function(){
						updateScore(0);
						scene.remove(shaker);
						bounceMode = speed = 0;
						gravity = 1;
						addShaker();
						ready = true;
				});
		}
		else $('#score').html('You Already Flipped Today!');
}

function updateScore(newScore) {
		score = newScore >= score ? newScore : 0;
		$('#userScore').html(score);
}