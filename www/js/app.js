var camera, scene, renderer, projector, mouse;
var cloudMaterial, cloudGeometry;
var coinMaterial, coinGeometry;
var pepper, shaker;
var successMessage 	= "You got it! Share your victory!";
var headMessage 		= "It landed on its head!";
var failureMessage 	= "Sorry, you didn't land it.";
var rising = falling = bouncing = false;
var speed = weight = gravity = deceleration = acceleration = 0;
var bounceMode = score = 0;
var shakerPieces = [];
var coins = [];
var ready = false;
var shareMessage = "";
var myvar = 0;
init();

function init() {
		mouse = new THREE.Vector2();
		projector = new THREE.Projector();
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor( 0x59c7e8 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 500;
		scene = new THREE.Scene();

		prepareClouds();
		addClouds(100);
		
		prepareCoins();
		addCoins(1);
		
		addTable();
		
		prepareShaker();
		addShaker();
	
		ready = true;
		animate();
}

function prepareClouds() {
		var backgroundTexture = new THREE.ImageUtils.loadTexture('textures/clouds.png');
		backgroundTexture.anistropy = renderer.getMaxAnisotropy();
		backgroundGeometry = new THREE.PlaneGeometry(240, 156);
		backgroundMaterial = new THREE.MeshBasicMaterial( { map: backgroundTexture, transparent: true } );
}
function addClouds(numClouds) {
		for(var i = 0; i < numClouds; i++) {
				var background = new THREE.Mesh( backgroundGeometry, backgroundMaterial );
				background.position.z = -100;
				background.position.y = 300 + (Math.random() * window.innerHeight * 40);
				background.position.x = (Math.random() * window.innerWidth)-(window.innerWidth/2);
				scene.add(background);
		}
}

function prepareCoins() {
		coinGeometry = new THREE.BoxGeometry( 100, 100, 100 );
		coinMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
}

function addCoins(numCoins) {
		for(var i = 0; i < numCoins; i++) {
				var coin = new THREE.Mesh( coinGeometry, coinMaterial );
				coin.position.y = 500;
				coins.push(coin);
				scene.add(coin);
		}
}

function addTable() {
		var tableGeometry = new THREE.BoxGeometry( 800, 100, 500 );
		var tableTexture = THREE.ImageUtils.loadTexture( 'textures/wood.jpg' );
		tableTexture.anisotropy = renderer.getMaxAnisotropy();
		var tableMaterial = new THREE.MeshBasicMaterial( { map: tableTexture } );
		var table = new THREE.Mesh( tableGeometry, tableMaterial );
		table.position.y = -235;
		scene.add(table);
}

function prepareShaker() {
		shaker = new THREE.Object3D();
		//create pepper shaker material
		var pepperTexture = THREE.ImageUtils.loadTexture( 'textures/pepper.jpg' );
		pepperTexture.wrapS = pepperTexture.wrapT = THREE.RepeatWrapping;
		pepperTexture.repeat.set(2,2);
		pepperTexture.anisotropy = renderer.getMaxAnisotropy();
		pepperMaterial = new THREE.MeshBasicMaterial( { map: pepperTexture } );
	
		//create pepper shaker top
		var topCylinder = new THREE.CylinderGeometry(70, 85, 60, 50, 50, false);
		var topTexture 	= THREE.ImageUtils.loadTexture( 'textures/chrome.jpg' );
		topTexture.anisotropy = renderer.getMaxAnisotropy();
		var topMaterial = new THREE.MeshBasicMaterial( { map: topTexture } );
		var pepperTop 	= new THREE.Mesh( topCylinder, topMaterial );
		pepperTop.position.y = 150;
	
		//create glass material
		var glassCylinder = new THREE.CylinderGeometry(85, 125, 250, 50, 50, false);
		var glassMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3 } );
		var glass 				= new THREE.Mesh( glassCylinder, glassMaterial );
	
		shakerPieces.push(glass);
		shakerPieces.push(pepperTop);
	
		shaker.add(glass);
		shaker.add(pepperTop);
}

function addShaker() {
		if(shaker.children.length === 3) {
				shaker.remove(pepper);
		}

		var rand 					= Math.random();
		var radBottom 		= 120;
		var radTop 				= radBottom - Math.floor(40*rand);
		var radSeg				= 50;
		var height 				= Math.floor(240*rand);
		var heightSeg 		= 50;
		weight 						= 0.05*rand;
		var pepperGeometry= new THREE.CylinderGeometry(radTop, radBottom, height, radSeg, heightSeg, false);
		pepper		 				= new THREE.Mesh( pepperGeometry, pepperMaterial );
		pepper.position.y = -120 + height/2;

		//combine parts
		shaker.add(pepper);
		shaker.rotation.y = 1;
		scene.add(shaker);
}
            
function animate() {
		requestAnimationFrame( animate );
		deltaY();
		renderer.render( scene, camera );
}

function deltaX(acceleration) {
		if((rising || falling) && abs(shaker.position.x) < window.innerWidth*0.1) {
				shaker.position.x -= acceleration.x;
		}
}

function deltaY() {
		if(rising) 				rise();
		else if(falling) 	fall();
		else if(bouncing) bounce();
}

function rise() {
		detectCollision();
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

function detectCollision() {
		var originPoint = shaker.children[1].position.clone();
		for (var vertexIndex = 0; vertexIndex < shaker.children[1].geometry.vertices.length; vertexIndex++) {		
				var localVertex = shaker.children[1].geometry.vertices[vertexIndex].clone();
				var globalVertex = localVertex.applyMatrix4( shaker.children[1].matrix );
				var directionVector = globalVertex.sub( shaker.children[1].position );
				var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
				var collisionResults = ray.intersectObject( coins );
				if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
					alert('hit!');
		}
}

Hammer(document.getElementsByTagName('canvas')[0]).on('drag', function(event) {
		event.gesture.preventDefault();
		if(ready) {
				mouse.x = 	( event.gesture.startEvent.center.pageX / window.innerWidth 	) * 2 - 1;
				mouse.y = - ( event.gesture.startEvent.center.pageY / window.innerHeight	) * 2 + 1;
				var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
				projector.unprojectVector( vector, camera );

				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

				var intersects = raycaster.intersectObjects( shakerPieces );

				if(intersects.length > 0) {
						if((event.gesture.distance)/event.gesture.deltaTime > 0.05) {
								ready = false;
								gravity = 1;
								deceleration = 1.05+weight;
								acceleration = 1/deceleration;
								speed = 1000*((event.gesture.distance)/event.gesture.deltaTime);
								rising = true;
								$('header').html('Flipping!');
						}
						else $('header').html('Pull faster!')
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
//		var intersects = raycaster.intersectshakerPieces( shakerPieces );
//
//		if ( intersects.length > 0 ) {
//				intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
//		}
});

function popover(success, message) {
		bouncing 			= false;
		shareMessage 	= success ? 'I landed a '+score+' point Pepperflip! Think you can beat me?' : 'I missed my Pepperflip! Think you can land it?';
		var color 		= success ? '#2ecc71' : '#c0392b';
		$('#score').css('background', color).html(message).slideDown();
		$('header').hide();
		$('button').removeClass('hideImportant');
		localStorage.lastPepperflip = new Date().getDay();
		localStorage.lastPepperflipScore = score;
//		if(success) {
//				navigator.notification.prompt("Post your name to the leaderboards.", postVictory, You've Won!, ["Brag", "Cancel"], "");
//		}
}

function share(message) {
		window.plugins.socialsharing.share(shareMessage, null, null, 'http://www.google.com');
}

function postVictory(results) {
		if(results.buttonIndex == 1) {
				//POST with name & score
		}
}
function resetGame(){
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

function updateScore(newScore) {
		score = newScore >= score ? newScore : 0;
		$('#userScore').html(score);
}

function abs(num) {
		return (num>>31 ^ num) - num>>31;
}

function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight ); 
}