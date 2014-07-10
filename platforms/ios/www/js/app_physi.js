function World() {
		var world = this;
		var cloudGeometry, cloudMaterial;
		this.scene;
		this.camera;
		this.renderer;
		this.bonusPoints = 0;
		this.allCoins = [];
	
		'use strict';

		Physijs.scripts.worker 	= 'js/physijs_worker.js';
		Physijs.scripts.ammo 		= 'ammo.js';
	
		this.init = function(numClouds) {
				this.renderer = new THREE.WebGLRenderer({ antialias: true });
				this.renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( this.renderer.domElement );

				this.scene = new Physijs.Scene;
				this.scene.setGravity(new THREE.Vector3( 0, -10, 0 ));

				this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				this.camera.position.z = 500;
				
				prepareClouds();
		}
		
		this.addClouds = function(numClouds) {
				for(var i = 0; i < numClouds; i++) {
						var cloud = new THREE.Mesh( cloudGeometry, cloudMaterial );
						cloud.position.z = -100;
						cloud.position.y = 300 + (Math.random() * window.innerHeight * 40);
						cloud.position.x = (Math.random() * window.innerWidth)-(window.innerWidth/2);
						this.scene.add(cloud);
				}
		}
		
		var prepareClouds = function() {
				var cloudTexture = new THREE.ImageUtils.loadTexture('textures/clouds.png');
				cloudTexture.anistropy = world.renderer.getMaxAnisotropy();
				cloudGeometry = new THREE.PlaneGeometry(240, 156);
				cloudMaterial = new THREE.MeshBasicMaterial( { map: cloudTexture, transparent: true } );
		}
	
		this.addCoins = function(numCoins) {
				for(coin in this.allCoins) {
						this.scene.remove(this.allCoins[coin]);
				}
				this.allCoins = [];
				
				this.numCoins = numCoins;
				for(var i = 0; i < numCoins; i++) {
						this.allCoins.push(new Physijs.BoxMesh( 
								new THREE.CubeGeometry( 50, 50, 10 ), 
								Physijs.createMaterial(new THREE.MeshBasicMaterial( { color: 0xff0000 } ), 0, 0), 
								0 
						));
						this.allCoins[i].collisions = 0;
						this.allCoins[i].position.y = 300 + (Math.random() * window.innerHeight * 40);
						this.allCoins[i].position.x = (Math.random() * window.innerWidth)-(window.innerWidth/2);
						this.allCoins[i].addEventListener( 'collision', function() { 
								world.bonusPoints += 100;
								world.scene.remove(this);
						} );
						this.scene.add(this.allCoins[i]);
				}
		}
	
		this.addTable = function() {
				var tableGeometry = new THREE.CubeGeometry( 800, 100, 500 );
				var tableTexture = THREE.ImageUtils.loadTexture( 'textures/wood.jpg' );
				tableTexture.anisotropy = this.renderer.getMaxAnisotropy();
				var tableMaterial = Physijs.createMaterial(
					new THREE.MeshBasicMaterial( { map: tableTexture } ),
					1,
					0
				);
				var table = new Physijs.BoxMesh(tableGeometry, tableMaterial, 0);
				table.position.y = -235;
				this.scene.add(table);
		}
		
		this.addShaker = function(bottle) {
				this.scene.add(bottle);
		}
		
		this.onWindowResize = function() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight); 
		}
}

function Shaker(scale) {
		var pepperMaterial;
		this.scale = scale;
		this.bottle;
		this.weight;
	
		'use strict';

		Physijs.scripts.worker 	= 'js/physijs_worker.js';
		Physijs.scripts.ammo 		= 'ammo.js';
		
		this.init = function(renderer) {
				//create pepper shaker material
				var pepperTexture = THREE.ImageUtils.loadTexture( 'textures/pepper.jpg' );
				pepperTexture.wrapS = pepperTexture.wrapT = THREE.RepeatWrapping;
				pepperTexture.repeat.set(2,2);
				pepperTexture.anisotropy = renderer.getMaxAnisotropy();
				pepperMaterial = new THREE.MeshBasicMaterial( { map: pepperTexture } );

				//create pepper shaker top
				var topCylinder = new THREE.CylinderGeometry(70*scale, 85*scale, 60*scale, 50, 50, false);
				var topTexture 	= THREE.ImageUtils.loadTexture( 'textures/chrome.jpg' );
				topTexture.anisotropy = renderer.getMaxAnisotropy();
				var topMaterial = Physijs.createMaterial(
					new THREE.MeshBasicMaterial( { map: topTexture } ),
					0,
					0 
				);
				var pepperTop 	= new THREE.Mesh( topCylinder, topMaterial );
				pepperTop.position.y = 150*scale;

				//create glass material
				var glassCylinder = new THREE.CylinderGeometry(85*scale, 125*scale, 250*scale, 50, 50, false);
				var glassMaterial = Physijs.createMaterial(
					new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.3 } ),
					0,
					0
				);
				this.bottle = new Physijs.CylinderMesh( glassCylinder, glassMaterial, 20 );
				this.bottle.add(pepperTop);
		}
		
		this.refill = function() {
				if(this.bottle.children.length) this.bottle.remove(this.bottle.children[1]);
				var rand 					= Math.random();
				var radBottom 		= 120*scale;
				var radTop 				= radBottom - Math.floor(40*scale*rand);
				var radSeg				= 50;
				var height 				= Math.floor(240*scale*rand);
				var heightSeg 		= 50;
				this.weight 			= 0.05*rand;
				var pepperGeometry= new THREE.CylinderGeometry(radTop, radBottom, height, radSeg, heightSeg, false);
				var pepper		 		= new THREE.Mesh( pepperGeometry, pepperMaterial );
				pepper.position.y = -120*scale + height/2;

				//combine parts
				this.bottle.add(pepper);
				this.bottle.rotation.y = 1;
				this.bottle.position.y = -90;
		}
}

function Game() {
		this.game = this;
		this.world;
		this.shaker;
		var bottle;
		var successMessage 	= "You got it! Share your victory!";
		var headMessage 		= "It landed on its head!";
		var failureMessage 	= "Sorry, you didn't land it.";
		var rising 	= false, falling = false, bouncing = false;
		var speed = 0, weight = 0, accel = 0, decel = 0;
		var bounceMode = 0, score = 0;
		var coins = [];
		var ready = false;
		var shareMessage = "";
		var scale = 0.75;
		var speedCap = 100;
	
		this.init = function() {
				this.world = new World();
				this.world.init();
				this.world.addTable();
				this.world.addClouds(100);
				this.world.addCoins(20);
				this.shaker = new Shaker(0.75);
				this.shaker.init(this.world.renderer);
				this.shaker.refill();
				bottle = this.shaker.bottle;
				this.world.addShaker(bottle);
				this.animate();
				ready = true;
				
				Hammer(document.getElementsByTagName('canvas')[0]).on('drag', function(event) {
						event.gesture.preventDefault();
						if(ready) {
								if((event.gesture.distance)/event.gesture.deltaTime > 0.3) {
										ready = false;
										accel = 1.01+weight;
										decel = 1/accel;
										speed = 50*((event.gesture.distance)/event.gesture.deltaTime);
										if(speed > speedCap) speed = speedCap;
										$('header').slideUp();
										rising = true;
								} else $('header').html('Pull faster!');
						}
				});
		}
		
		this.animate = function() {
				game.world.scene.simulate();
				deltaY();
    		bottle.__dirtyPosition = true;
				requestAnimationFrame( game.animate );
				game.world.renderer.render( game.world.scene, game.world.camera );
		}
		
		this.deltaX = function(acceleration) {
				if((rising || falling) && abs(bottle.position.x) < window.innerWidth*0.1) {
						bottle.position.x -= acceleration.x;
				}
		}
		
		var deltaY = function() {
				if			(rising) 		rise();
				else if	(falling) 	fall();
				else if	(bouncing) 	bounce();
		}
		
		var rise = function() {
				if(speed < 10) {
						rising 	= false;
						falling = true;
				} else {
						bottle.rotation.x += 0.1;
						speed 						*= decel;
						bottle.position.y += speed;
						game.world.camera.position.y += speed;
					
						updateScore(score+10);
				}
		}
		
		var fall = function() {
				if(bottle.position.y <= -60) {
						falling = false;
						bottle.rotation.x = Math.round(bottle.rotation.x%6.3 * 10) / 10;
						bottle.position.y = -60;
						game.world.camera.position.y = 0;
						bouncing = true;
				} else {		
						bottle.rotation.x += 0.1;
						speed 						*= accel;
						bottle.position.y -= speed; 
						game.world.camera.position.y -= speed;
				}
		}
		
		var bounce = function() {
				if(!bounceMode) {
						if			(bottle.rotation.x >= 0 	&& bottle.rotation.x <  0.4) 	bounceMode = 1;
						else if (bottle.rotation.x >= 0.4 && bottle.rotation.x <  1.6) 	bounceMode = 2;
						else if (bottle.rotation.x >= 1.6 && bottle.rotation.x <  2.7) 	bounceMode = 3;
						else if (bottle.rotation.x >= 2.7 && bottle.rotation.x <  3.1) 	bounceMode = 4;
						else if (bottle.rotation.x >= 3.1 && bottle.rotation.x <  3.5) 	bounceMode = 5;
						else if (bottle.rotation.x >= 3.5 && bottle.rotation.x <  4.7)	bounceMode = 6;
						else if (bottle.rotation.x >= 4.7 && bottle.rotation.x <  5.9) 	bounceMode = 7;
						else if (bottle.rotation.x >= 5.9 && bottle.rotation.x <= 6.3)	bounceMode = 8;
				}
				switch(bounceMode) {
						case 1:
								if(bottle.rotation.x > 0)
										bottle.rotation.x -= 0.1;
								else {
										popover(true, successMessage);
										updateScore(score+1000);
								}
								break;
						case 2:
								if(bottle.rotation.x < 1.6) 
										bottle.rotation.x += 0.1;
								else {
										bottle.position.y -= 25;
										popover(false, failureMessage);
								}
								break;
						case 3:
								if(bottle.rotation.x > 1.6) 
										bottle.rotation.x -= 0.1;
								else {
										bottle.position.y -= 50;
										popover(false, failureMessage);
								}
								break;
						case 4:
								if(bottle.rotation.x < 3.1) 
										bottle.rotation.x += 0.1;
								else {
										popover(false, headMessage);
										updateScore(score-1000);
								}
								break;
						case 5:
								if(bottle.rotation.x > 3.1) 
										bottle.rotation.x -= 0.1;
								else {
										popover(false, headMessage);
										updateScore(score-1000);
								}
								break;
						case 6:
								if(bottle.rotation.x < 4.7) 
										bottle.rotation.x += 0.1;
								else {
										popover(false, failureMessage);
								}
								break;
						case 7:
								if(bottle.rotation.x > 4.7) 
										bottle.rotation.x -= 0.1;
								else {
										popover(false, failureMessage);
								}
								break;
						case 8:
								if(bottle.rotation.x < 6.3) 
										bottle.rotation.x += 0.1;
								else {
										popover(true, successMessage);
										updateScore(score+1000);
								}
								break;
				}
		}
		
		this.share = function(message) {
				window.plugins.socialsharing.share(shareMessage, null, null, 'http://rmartinez.co/pepperflip');
		}
		
		this.resetGame = function(){
				$('header').slideDown();
				$('header').html('Flip Shaker to Pepperflip...');
				$('button').addClass('hideImportant');
				$('#score').hide(function(){
						$('#title').html('SCORE').css('color', '#fff');
						game.shaker.refill();
						game.world.addCoins(20);
						game.world.bonusPoints = 0;
						updateScore(0);
						bounceMode = speed = 0;
						bottle.rotation.x = 0;
						bottle.position.x = 0;
						bottle.position.y = -90;
						ready = true;
				});
		}
		
		var popover = function(success, message) {
				bouncing 			= false;
				shareMessage 	= success ? 'I landed a '+score+' point Pepperflip! Think you can beat me?' : 'I missed my Pepperflip! Think you can land it?';
				var color 		= success ? '#2ecc71' : '#c0392b';
				updateScore(score+game.world.bonusPoints);
				$('#title').html('FINAL').css('color', '#3498db');
				$('#score').css('background', color).html(message).slideDown();
				$('button').removeClass('hideImportant');
				localStorage.lastPepperflip = new Date().getDay();
				localStorage.lastPepperflipScore = score;
		//		if(success) {
		//				navigator.notification.prompt("Post your name to the leaderboards.", postVictory, You've Won!, ["Brag", "Cancel"], "");
		//		}
		}
		
		var postVictory = function(results) {
				if(results.buttonIndex == 1) {
						//POST with name & score
				}
		}
		
		var updateScore = function(newScore, special) {
				score = newScore >= score ? newScore : 0;
				$('#num').html(score);
		}
		
		var abs = function(num) {
				return (num>>31 ^ num) - num>>31;
		}
}

var game = new Game();
		game.init();
//window.addEventListener( 'resize', game.world.onWindowResize, false );