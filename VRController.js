/**
 * @author Stewart Smith / http://stewartsmith.io
 * @author Jeff Nusz / http://custom-logic.com
 * @author Data Arts Team / https://github.com/dataarts
 */




/*


	THREE.VRController




	Why is this useful?
	
	1. This creates a THREE.Object3D() per connected Gamepad instance and 
	   passes it to you through a Window event for inclusion in your scene. 
	   It then handles copying the live positions and orientations from the
	   Gamepad instance to this Object3D.
	2. It also broadcasts Gamepad button and axes events to you on this
	   Object3D instance. For your convenience button names are mapped to
	   objects in the buttons array on supported devices. (And this support 
	   is easy to extend.) For implicitly supported devices you can continue
	   to use the buttons array indexes.
	3. This one JS file explicitly supports several existing VR controllers,
	   and implicitly supports any controllers that operate similarly!

	
	What do I have to do?
	
	1. Include THREE.VRController.update() in your animation loop and listen
	   for controller connection events like so:
	   window.addEventlistener('vr controller connected', (controller)=>{}).
	2. When you receive a controller instance -- again, just an Object3D --
	   you ought to set its standingMatrix property equal to your
	   renderer.vr.getStandingMatrix(). If you are expecting a 3DOF controller
	   you must set its head property equal to your camera.
	3. Experiment and HAVE FUN!


*/




    ///////////////////////
   //                   //
  //   VR Controller   //
 //                   //
///////////////////////


THREE.VRController = function( gamepad ){

	var
	supported,
	handedness  = '',
	axes        = [],
	axesMaps    = [],
	buttons     = [],
	buttonNames = [],
	buttonNamePrimary

	THREE.Object3D.call( this )
	this.matrixAutoUpdate = false


	//  ATTENTION !
	//
	//  You ought to overwrite these TWO special properties on the instance in
	//  your own code. For example for 6DOF controllers:
	//    controller.standingMatrix = renderer.vr.getStandingMatrix()
	//  And for 3DOF controllers:
	//    controller.head = camera
	//  Quick FYI: “DOF” means “Degrees of Freedom”. If you can rotate about 
	//  3 axes and also move along 3 axes then 3 + 3 = 6 degrees of freedom.

	this.standingMatrix = new THREE.Matrix4()
	this.head = {

		position:   new THREE.Vector3(),
		quaternion: new THREE.Quaternion()
	}


	//  It is crucial that we have a reference to the actual gamepad.
	//  In addition to requiring its .pose for position and orientation
	//  updates, it also gives us all the goodies like .id, .index,
	//  and maybe best of all... haptics!

	this.gamepad = gamepad
	this.name    = gamepad.id
	this.dof     = 3 * ( +gamepad.pose.hasOrientation + +gamepad.pose.hasPosition )


	//  Setup states so we can watch for change events.
	//  This includes handedness, axes, and buttons.

	handedness = gamepad.hand


	//  Note that the plural of axis is axes -- and that is not only a source
	//  of confusion for non-native English speakers, it trips me up too.
	//  First, let’s copy the Gamepad’s axes values into our own array.

	axes.byName = {}
	gamepad.axes.forEach( function( axis, i ){

		axes[ i ] = axis
	})


	//  Similarly we’ll create a default set of button objects.

	buttons.byName = {}
	gamepad.buttons.forEach( function( button, i ){

		buttons[ i ] = {

			name:     'button_'+ i,
			value:     button.value,
			isTouched: button.touched,
			isPressed: button.pressed,
			isPrimary: false
		}
	})


	//  Do we recognize this type of controller based on its gamepad.id?
	//  If not we’ll still roll with it, we just won’t have axes and buttons
	//  mapped to convenience strings. No biggie.

	supported = THREE.VRController.supported[ gamepad.id ]
	if( supported !== undefined ){

		this.style = supported.style
		if( supported.axes !== undefined ){

			supported.axes.forEach( function( axesMap ){

				axes.byName[ axesMap.name ] = axesMap.indexes
			})
		}
		if( supported.buttons !== undefined ){

			supported.buttons.forEach( function( buttonName, i ){

				buttons[ i ].name = buttonName
			})
		}
		buttonNamePrimary = supported.primary
	}


	//  This will allow you to listen for 'primary press began', etc.
	//  even if we don’t explicitly support this controller model.
	//  Right now convention seems to be that button #0 will be a thumbpad
	// (Vive, Oculus, Daydream, GearVR) or thumbstick (Microsoft).
	//  If there is a trigger then that sits in slot #1 (Vive, Oculus,
	//  Micrsoft) and becomes the primary button. But if there is no trigger
	//  then the thumbpad becomes the primary button (Daydream, GearVR).

	buttons.forEach( function( button ){

		buttons.byName[ button.name ] = button
	})
	if( buttonNamePrimary === undefined ) buttonNamePrimary = gamepad.buttons.length > 1 ? 'button_1' : 'button_0'
	buttons.byName[ buttonNamePrimary ].isPrimary = true


	//  Let’s make some getters! 

	this.getHandedness = function(){

		return handedness
	}
	this.getAxis = function( index ){

		return axes[ index ]
	}
	this.getAxes = function( nameOrIndex ){

		var values = []

		if( nameOrIndex === undefined ) return axes
		else if( typeof nameOrIndex === 'string' ){

			axes.byName[ nameOrIndex ].forEach( function( index ){

				values.push( axes[ index ])
			})
			return values
		}
		else if( typeof nameOrIndex === 'number' ) return axes[ nameOrIndex ]
	}
	this.getButton = function( nameOrIndex ){

		if( typeof nameOrIndex === 'string' ){

			if( nameOrIndex === 'primary' ) nameOrIndex = buttonNamePrimary
			return buttons.byName[ nameOrIndex ]
		}
		else if( typeof nameOrIndex === 'number' ) return buttons[ nameOrIndex ]
	}


	//  During your development phase you may need to do a reality check for
	//  your own sanity. What controller is this?! What capabilities do we
	//  think it has? This will help!

	this.report = function(){ return (

		'#'+ gamepad.index +': '+ gamepad.id +
		'\n\tStyle: '+ this.style +
		'\n\tDOF: '+ this.dof +
		'\n\tHandedness: '+ handedness +
		'\n\tAxes: '+ axes.reduce( function( a, e, i ){
		
			return a + e + ( i < axes.length - 1 ? ', ' : '' )
		
		}, '' ) +
		'\n\tButtons:'+ buttons.reduce( function( a, e ){ return (
		
			a +
			'\n\t\tName: '+ e.name +
			'\n\t\t\tValue:     '+ e.value +
			'\n\t\t\tisTouched: '+ e.isTouched +
			'\n\t\t\tisPressed: '+ e.isPressed +
			'\n\t\t\tisPrimary: '+ e.isPrimary
		
		)}, '' ) +
		'\n\tPrimary button: '+ buttonNamePrimary
	)}


	//  Now we’re ready to listen and compare saved state to current state.

	this.pollForChanges = function(){

		var
		verbosity      = THREE.VRController.verbosity,
		controller     = this,
		controllerInfo = '> #'+ controller.gamepad.index +' '+ controller.gamepad.id +' (Handedness: '+ handedness +') ',
		axesNames      = Object.keys( axes.byName ),
		axesChanged    = false


		//  Did the handedness change?

		if( handedness !== controller.gamepad.hand ){

			if( verbosity >= 0.4 ) console.log( controllerInfo +'hand changed from "'+ handedness +'" to "'+ controller.gamepad.hand +'"' )
			handedness = controller.gamepad.hand
			controller.dispatchEvent({ type: 'hand changed', hand: handedness })
		}


		//  Do we have named axes? 
		//  If so let’s ONLY check and update those values.

		if( axesNames.length > 0 ){

			axesNames.forEach( function( axesName ){

				var axesValues  = []

				axesChanged = false
				axes.byName[ axesName ].forEach( function( index ){

					if( gamepad.axes[ index ] !== axes[ index ]){

						axesChanged = true
						axes[ index ] = gamepad.axes[ index ]
					}
					axesValues.push( axes[ index ])
				})
				if( axesChanged ){

					if( verbosity >= 0.7 ) console.log( controllerInfo + axesName +' axes changed', axesValues )
					controller.dispatchEvent({ type: axesName +' axes changed', axes: axesValues })
				}
			})
		}


		//  Otherwise we need to check and update ALL values.

		else {

			gamepad.axes.forEach( function( axis, i ){

				if( axis !== axes[ i ]){

					axesChanged = true
					axes[ i ] = axis
				}
			})
			if( axesChanged ){

				if( verbosity >= 0.7 ) console.log( controllerInfo +'axes changed', axes )
				controller.dispatchEvent({ type: 'axes changed', axes: axes })
			}
		}


		//  Did any button states change?

		buttons.forEach( function( button, i ){

			var
			controllerAndButtonInfo = controllerInfo + button.name +' ',
			isPrimary = button.isPrimary,
			eventAction


			//  If this button is analog-style then its values will range from
			//  0.0 to 1.0. But if it’s binary you’ll only received either a 0
			//  or a 1. In that case 'value' usually corresponds to the press
			//  state: 0 = not pressed, 1 = is pressed.

			if( button.value !== gamepad.buttons[ i ].value ){

				button.value = gamepad.buttons[ i ].value
				if( verbosity >= 0.6 ) console.log( controllerAndButtonInfo +'value changed', button.value )
				controller.dispatchEvent({ type: button.name +' value changed', value: button.value })
				if( isPrimary ) controller.dispatchEvent({ type: 'primary value changed', value: button.value })
			}


			//  Some buttons have the ability to distinguish between your hand
			//  making contact with the button and the button actually being
			//  pressed. (Useful!) Some buttons fake a touch state by using an
			//  analog-style value property to make rules like: for 0.0 .. 0.1
			//  touch = true, and for >0.1 press = true. 

			if( button.isTouched !== gamepad.buttons[ i ].touched ){

				button.isTouched = gamepad.buttons[ i ].touched
				eventAction = button.isTouched ? 'began' : 'ended'
				if( verbosity >= 0.5 ) console.log( controllerAndButtonInfo +'touch '+ eventAction )
				controller.dispatchEvent({ type: button.name +' touch '+ eventAction })
				if( isPrimary ) controller.dispatchEvent({ type: 'primary touch '+ eventAction })
			}


			//  This is the least complicated button property.

			if( button.isPressed !== gamepad.buttons[ i ].pressed ){

				button.isPressed = gamepad.buttons[ i ].pressed
				eventAction = button.isPressed ? 'began' : 'ended'
				if( verbosity >= 0.5 ) console.log( controllerAndButtonInfo +'press '+ eventAction )
				controller.dispatchEvent({ type: button.name +' press '+ eventAction })
				if( isPrimary ) controller.dispatchEvent({ type: 'primary press '+ eventAction })
			}
		})
	}
}
THREE.VRController.prototype = Object.create( THREE.Object3D.prototype )
THREE.VRController.prototype.constructor = THREE.VRController




//  Update the position, orientation, and button states,
//  fire button events if nessary.

THREE.VRController.prototype.update = function(){

	var
	gamepad = this.gamepad,
	pose = gamepad.pose


	//  ORIENTATION.
	//  Everyone should have this -- this is expected of 3DOF controllers.
	//  If we don’t have it this could mean we’re in the process of losing tracking.
	//  Fallback plan is just to retain the previous orientation data.
	//  If somehow we never had orientation data it will use the default
	//  THREE.Quaternion our controller’s Object3D was initialized with.

	if( pose.orientation !== null ) this.quaternion.fromArray( pose.orientation )


	//  POSITION -- EXISTS!
	//  If we have position data then we can assume we also have orientation
	//  because this is the expected behavior of 6DOF controllers.
	//  If we don’t have orientation it will just use the previous orientation data.

	if( pose.position !== null ){

		this.position.fromArray( pose.position )
		this.matrix.compose( this.position, this.quaternion, this.scale )
	}


	//  POSITION -- NOPE ;(
	//  But if we don’t have position data we’ll assume our controller is only 3DOF
	//  and use an arm model that takes head position and orientation into account.
	//  So don’t forget to set controller.head to reference your VR camera so we can
	//  do the following math.

	else {


		//  If this is our first go-round with a 3DOF this then we’ll need to
		//  create the arm model.

		if( this.armModel === undefined ){

			if( THREE.VRController.verbosity >= 0.5 ) console.log( '> #'+ gamepad.index +' '+ gamepad.id +' (Handedness: '+ this.getHandedness() +') adding OrientationArmModel' )
			this.armModel = new OrientationArmModel()
		}


		//  Now and forever after we can just update this arm model
		//  with the head (camera) position and orientation
		//  and use its output to predict where the this is.

		this.armModel.setHeadPosition( this.head.position )
		this.armModel.setHeadOrientation( this.head.quaternion )
		this.armModel.setControllerOrientation(( new THREE.Quaternion() ).fromArray( pose.orientation ))
		this.armModel.update()
		this.matrix.compose(

			this.armModel.getPose().position,
			this.armModel.getPose().orientation,
			this.scale
		)
	}


	//  Ok, we know where the this ought to be so let’s set that.
	//  For 6DOF controllers it’s necessary to set controller.standingMatrix
	//  to reference your VRControls.standingMatrix, otherwise your controllers
	//  will be on the floor instead of up in your hands!
	//  NOTE: “VRControls” and “VRController” are similarly named but two
	//  totally different things! VRControls is what reads your headset’s
	//  position and orientation, then moves your camera appropriately.
	//  Whereas this VRController instance is for the VR controllers that
	//  you hold in your hands.

	this.matrix.multiplyMatrices( this.standingMatrix, this.matrix )
	this.matrixWorldNeedsUpdate = true


	//  Poll for changes in handedness, axes, and button states.
	//  If there’s a change this function fires the appropriate event.

	this.pollForChanges()


	//  If you’ve ever wanted to run the same function over and over --
	//  once per update loop -- now’s your big chance.

	if( typeof this.updateCallback === 'function' ) this.updateCallback()
}




    /////////////////
   //             //
  //   Statics   //
 //             //
/////////////////


//  This makes inspecting through the console a little bit saner.
//  Expected values range from 0.0 to 1.0.

THREE.VRController.verbosity = 0.7//0.5 or 0.7 are good...


//  We need to keep a record of found controllers
//  and have some connection / disconnection handlers.

THREE.VRController.controllers = []
THREE.VRController.onGamepadConnect = function( gamepad ){


	//  Let’s create a new controller object
	//  that’s really an extended THREE.Object3D
	//  and pass it a reference to this gamepad.

	var
	scope = THREE.VRController,
	controller = new scope( gamepad ),
	hapticActuators = controller.gamepad.hapticActuators


	//  We also need to store this reference somewhere so that we have a list
	//  controllers that we know need updating, and by using the gamepad.index
	//  as the key we also know which gamepads have already been found.

	scope.controllers[ gamepad.index ] = controller


	//  Let’s give the controller a little rumble; some haptic feedback to
	//  let the user know it’s connected and happy.

	if( hapticActuators && hapticActuators[ 0 ]) hapticActuators[ 0 ].pulse( 0.1, 300 )


	//  Now we’ll broadcast a global connection event.
	//  We’re not using THREE’s dispatchEvent because this event
	//  is the means of delivering the controller instance.
	//  How would we listen for events on the controller instance
	//  if we don’t already have a reference to it?!

	if( scope.verbosity >= 0.5 ) console.log( 'vr controller connected', controller )
	if( scope.verbosity >= 0.7 ) console.log( controller.report() )
	window.setTimeout( function(){

		window.dispatchEvent( new CustomEvent( 'vr controller connected', { detail: controller }))

	}, 500 )
}
THREE.VRController.onGamepadDisconnect = function( gamepad ){


	//  We need to find the controller that holds the reference to this gamepad.
	//  Then we can broadcast the disconnection event on the controller itself
	//  and also overwrite our controllers object with undefined. Goodbye!
	//  When you receive this event don’t forget to remove your meshes and whatnot
	//  from your scene so you can either reuse them upon reconnect -- or you
	//  should detroy them. You don’t want memory leaks, right?

	var
	scope = THREE.VRController,
	controller = scope.controllers[ gamepad.index ]

	if( scope.verbosity >= 0.5 ) console.log( 'vr controller disconnected', controller )
	controller.dispatchEvent({ type: 'disconnected', controller: controller })
	scope.controllers[ gamepad.index ] = undefined
}


//  This is what makes everything so convenient. We keep track of found
//  controllers right here. And by adding this one update function into your
//  animation loop we automagically update all the controller positions,
//  orientations, and button states.
//  Why not just wrap this in its own requestAnimationFrame loop? Performance!
//  https://jsperf.com/single-raf-draw-calls-vs-multiple-raf-draw-calls
//  But also, you will likely be switching between window.requestAnimationFrame
//  which aims for 60fps and vrDisplay.requestAnimationFrame which aims for 90
//  when switching between non-VR and VR rendering. This makes it trivial to
//  make the choices YOU want to.

THREE.VRController.update = function(){

	var gamepads, gamepad, i


	//  Before we do anything we ought to see if getGamepads even exists.
	// (Perhaps in addition to actual VR rigs you’re also supporting
	//  iOS devices via magic window?) If it doesn’t exist let’s bail:

	if( navigator.getGamepads === undefined ) return


	//  Yes, we need to scan the gamepads Array with each update loop
	//  because it is the *safest* way to detect new gamepads / lost gamepads
	//  and we avoid Doob’s proposed problem of a user accidentally including
	//  VRControllers.js multiple times if we were using 'ongamepadconnected'
	//  and 'ongamepaddisconnected' events firing multiple times.
	//  Also... those connection events are not widely supported yet anyhow.

	gamepads = navigator.getGamepads()


	//  For some reason the early examples of using the Gamepad API iterate over
	//  a fixed range: 0..3. But MS Edge seems to have 4 nulls (why?!) and then
	//  add the Motion Controllers to index 4 and 5!

	for( i = 0; i < gamepads.length; i ++ ){


		//  The Gamepad API is a funny thing. I wrote about some of its 
		//  quirks, specifically in Chromium, here:
		//  https://medium.com/@stew_rtsmith/webvr-controllers-and-chromiums-gamepad-api-6c9adc633f38
		//  For brevity here I’ll just say we won’t outright accept what the 
		//  API tells us exists. (It can create ghost controllers!)
		//  Instead we will consider a Gamepad exists only when it is reported
		//  by the API and ALSO has not-null position or not-null orientation.

		//  Could probably change this to “if( gamepad instanceof Gamepad )”
		//  but dealing with these things across browsers and devices has made
		//  me extra paranoid. Best to verify the pose object is really there.

		gamepad = gamepads[ i ]
		if( gamepad      !== undefined &&//  Just for you, Microsoft Edge!
			gamepad      !== null &&     //  Meanwhile Chrome and Firefox do it this way.
			gamepad.pose !== undefined &&
			gamepad.pose !== null ){


			//  We've just confirmed that a “ready” Gamepad instance exists in
			//  this slot. If it’s not already in our controllers list we need
			//  to initiate it! Either way we need to call update() on it.

			if( gamepad.pose.orientation !== null || gamepad.pose.position !== null ){

				if( this.controllers[ i ] === undefined ) THREE.VRController.onGamepadConnect( gamepad )
				this.controllers[ i ].update()
			}


			//  If we’ve lost orientation and position then we’ve lost this
			//  controller. Unfortunately we cannot rely on gamepad.connected
			//  because it will ALWAYS equal true -- even if you power down
			//  the controller! (At least in Chromium.) That doesn’t seem like
			//  the API’s intended behavior but it’s what I see in practice.

			else if( this.controllers[ i ] !== undefined ) THREE.VRController.onGamepadDisconnect( gamepad )
		}
	}
}
THREE.VRController.report = function(){

	THREE.VRController.controllers.forEach( function( controller ){

		console.log( '\n'+ controller.report() )
	})
}








    /////////////////
   //             //
  //   Support   //
 //             //
/////////////////


//  Let’s take an ID string as reported directly from the Gamepad API,
//  translate that to a more generic “style name” and also see if we can’t map
//  some names to things for convenience. (This stuff was definitely fun to
//  figure out.) These are roughly in order of complexity, simplest first:

THREE.VRController.supported = {




	    //////////////////
	   //              //
	  //   Daydream   //
	 //              //
	//////////////////


	'Daydream Controller': {

		style: 'daydream',


		//  Daydream’s thumbpad is both a 2D trackpad and a button with both
		//  touch and press. The Y-axis is Regular.
		//
		//              Top: Y = -1
		//                   ↑
		//    Left: X = -1 ←─┼─→ Right: X = +1
		//                   ↓
		//           Bottom: Y = +1
		
		axes: [{ name: 'thumbpad', indexes: [ 0, 1 ]}],
		buttons: [ 'thumbpad' ],
		primary: 'thumbpad'
	},




	    //////////////
	   //          //
	  //   Vive   //
	 //          //
	//////////////


	'OpenVR Gamepad': {

		style: 'vive',


		//  Vive’s thumbpad is both a 2D trackpad and a button. Its Y-axis is 
		//  Goofy -- in contrast to Daydream, Oculus, Microsoft, etc.
		//
		//              Top: Y = +1
		//                   ↑
		//    Left: X = -1 ←─┼─→ Right: X = +1
		//                   ↓
		//           Bottom: Y = -1

		axes: [{ name: 'thumbpad', indexes: [ 0, 1 ]}],
		buttons: [


			//  Vive’s thumbpad registers touch and press distinctly.
			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: ACTUAL BOOLEAN FOR TOUCH!
			//  isPressed: As expected.

			'thumbpad',


			//  ===  Chromium  ===============================================
			//  if( value >  0.00 ) isTouched = true else isTouched = false
			//  UPON ENGAGING
			//  if( value >= 0.55 ) isPressed = true
			//  UPON RELEASING
			//  if( value <  0.45 ) isPressed = false

			//  ===  Firefox  ================================================
			//  UPON ENGAGING
			//  if( value >= 0.10 ) isTouched = isPressed = true
			//  UPON RELEASING
			//  if( value <  0.10 ) isTouched = isPressed = false

			//  value:     Analog 0 to 1.
			//  isTouched: Duplicates isPressed in FF, independent in Chrome.
			//  isPressed: Corresponds to value.

			'trigger',


			//  Each Vive controller has two grip buttons, one on the left and
			//  one on the right. They are not distinguishable -- pressing 
			//  either one will register as a press with no knowledge of which
			//  one was pressed. This value is binary, 0 = neither touched nor
			//  pressed, 1 = both touched and pressed. So no need to track 
			//  anything other than the isPressed boolean.

			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: Duplicates isPressed.
			//  isPressed: As expected.

			'grips',


			//  The menu button is the tiny button above the thumbpad -- NOT
			//  the one below it. Simple binary on / off press.

			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: Duplicates isPressed.
			//  isPressed: As expected.

			'menu'
		],
		primary: 'trigger'
	},




	    ////////////////
	   //            //
	  //   Oculus   //
	 //            //
	////////////////


	'Oculus Touch (Right)': {


		//  Previously I’d named the style “Rift” and referred to this as a 
		// “Rift” in the comments because it’s so much easier to write and to 
		//  say than “Oculus”. Lazy, right? But deep down in your dark heart 
		//  I know you agree with me. But I changed it all to “oculus” now 
		//  because that’s what both the headset and the controllers report 
		//  themselves as. There’s no mention of “Rift” in those ID strings at
		//  all. I felt in the end consistency was better than ease.

		style: 'oculus',


		//  Oculus’s thumbstick has axes values and is also a button.
		//  The Y-axis is Regular.
		//
		//              Top: Y = -1
		//                   ↑
		//    Left: X = -1 ←─┼─→ Right: X = +1
		//                   ↓
		//           Bottom: Y = +1

		axes: [{ name: 'thumbstick', indexes: [ 0, 1 ]}],
		buttons: [


			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: ACTUAL BOOLEAN FOR TOUCH!
			//  isPressed: As expected.

			'thumbstick',


			//  ===  Chromium  ===============================================
			//  Oculus’s trigger in Chromium is far more fire-happy than Vive’s.
			//  Compare these thresholds to Vive’s trigger:
			//  if( value >  0.00 ) isTouched = true else isTouched = false
			//  UPON ENGAGING
			//  if( value >= 0.10 ) isPressed = true
			//  UPON RELEASING
			//  if( value <  0.10 ) isPressed = false

			//  ===  Firefox  ================================================
			//  UPON ENGAGING
			//  if( value >= 0.10 ) isTouched = isPressed = true
			//  UPON RELEASING
			//  if( value <  0.10 ) isTouched = isPressed = false

			//  value:     Analog 0 to 1.
			//  isTouched: Duplicates isPressed in FF, independent in Chrome.
			//  isPressed: Corresponds to value.

			'trigger',


			//  Oculus’s grip button follows the exact same press thresholds
			//  as its trigger.

			'grip',


			//  Oculus has two old-school video game buttons, A and B. (On the
			//  left-hand controller these are X and Y.)
			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: ACTUAL BOOLEAN FOR TOUCH!
			//  isPressed: As expected.

			'A', 'B',


			//  Oculus has an inert base “button” that’s really just a resting
			//  place for your thumbs. It only reports a binary on/off for 
			//  touch and has no press.
			//  value:     Always 0.
			//  isTouched: ACTUAL BOOLEAN FOR TOUCH!
			//  isPressed: N/A.

			'thumbrest'
		],
		primary: 'trigger'
	},
	'Oculus Touch (Left)': {

		style: 'oculus',
		axes: [{ name: 'thumbstick', indexes: [ 0, 1 ]}],
		buttons: [

			'thumbstick',
			'trigger',
			'grip',
			'X', 'Y',
			'thumbrest'
		],
		primary: 'trigger'
	},




	    ///////////////////
	   //               //
	  //   Microsoft   //
	 //               //
	///////////////////


	'Spatial Controller (Spatial Interaction Source) 045E-065B': {


		//  It’s hard to know what to call these controllers. They report as
		// “Spatial Controllers” but are branded as “Motion Controllers”
		//  and they’re for “Windows Mixed Reality” devices... 
		// “Microsoft Windows Mixed Reality Spatial Motion Controller”?
		//  Perhaps best to just label them as “Microsoft” for now and revisit
		//  in the future if need be.
		//  NOTE: Currently Windows MR devices only function in MS Edge!

		style: 'microsoft',


		//  Microsoft’s controllers have two 2D axes. Both Y-axes are Regular.
		//
		//              Top: Y = -1
		//                   ↑
		//    Left: X = -1 ←─┼─→ Right: X = +1
		//                   ↓
		//           Bottom: Y = +1

		axes: [


			//  The thumbstick is super twitchy, fires when you breathe on it.
			//  And sometimes when you don’t. 

			{ name: 'thumbstick', indexes: [ 0, 1 ]},
			{ name: 'thumbpad',   indexes: [ 2, 3 ]}
		],
		buttons: [


			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: Duplicates isPressed.
			//  isPressed: As expected.

			'thumbstick',


			//  Trigger’s physical range of motion noticably exceeds the range
			//  of values reported. For example when engaging you can continue
			//  to squueze beyond when the value reports 1.0. And when 
			//  releasing you will reach value === 0 before the trigger is 
			//  completely released. The value property dictates touch and
			//  press states as follows:

			//  UPON ENGAGING
			//  if( value >= 0.00 && value < 0.10 ) NO values reported at all!
			//  if( value >= 0.10 ) isTouched = true
			//  if( value >= 0.12 ) isPressed = true

			//  UPON RELEASING
			//  if( value <  0.12 ) isPressed = false
			//  if( value == 0.00 ) isTouched = false

			//  value:     Analog 0 to 1.
			//  isTouched: Simulated, corresponds to value.
			//  isPressed: Corresponds to value.

			'trigger',


			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: Duplicates isPressed.
			//  isPressed: As expected.

			'grip',


			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: Duplicates isPressed.
			//  isPressed: As expected.

			'menu',


			//  This is the only button that has actual touch detection.
			//  value:     Binary 0 or 1, duplicates isPressed.
			//  isTouched: ACTUAL BOOLEAN FOR TOUCH!
			//  isPressed: As expected.

			'thumbpad'
		],
		primary: 'trigger'
	}
}








    ///////////////////
   //               //
  //   Arm Model   //
 //               //
///////////////////


//  Adapted from Boris’ code in a hurry -- many thanks, Mr. Smus!
//  Represents the arm model for the Daydream controller.
//  Feed it a camera and the controller. Update it on a RAF.
//  Get the model's pose using getPose().

function OrientationArmModel(){

	this.isLeftHanded = false;


	//  Current and previous controller orientations.

	this.controllerQ     = new THREE.Quaternion();
	this.lastControllerQ = new THREE.Quaternion();


	//  Current and previous head orientations.

	this.headQ = new THREE.Quaternion();


	//  Current head position.

	this.headPos = new THREE.Vector3();


	//  Positions of other joints (mostly for debugging).

	this.elbowPos = new THREE.Vector3();
	this.wristPos = new THREE.Vector3();


	//  Current and previous times the model was updated.

	this.time     = null;
	this.lastTime = null;


	//  Root rotation.

	this.rootQ = new THREE.Quaternion();


	//  Current pose that this arm model calculates.

	this.pose = {

		orientation: new THREE.Quaternion(),
		position:    new THREE.Vector3()
	}
}


//  STATICS.

Object.assign( OrientationArmModel, {

	HEAD_ELBOW_OFFSET       : new THREE.Vector3(  0.155, -0.465, -0.15 ),
	ELBOW_WRIST_OFFSET      : new THREE.Vector3(  0, 0, -0.25 ),
	WRIST_CONTROLLER_OFFSET : new THREE.Vector3(  0, 0, 0.05 ),
	ARM_EXTENSION_OFFSET    : new THREE.Vector3( -0.08, 0.14, 0.08 ),
	ELBOW_BEND_RATIO        : 0.4,//  40% elbow, 60% wrist.
	EXTENSION_RATIO_WEIGHT  : 0.4,
	MIN_ANGULAR_SPEED       : 0.61//  35˚ per second, converted to radians.
});


//  SETTERS.
//  Methods to set controller and head pose (in world coordinates).

OrientationArmModel.prototype.setControllerOrientation = function( quaternion ){

	this.lastControllerQ.copy( this.controllerQ );
	this.controllerQ.copy( quaternion );
}
OrientationArmModel.prototype.setHeadOrientation = function( quaternion ){

	this.headQ.copy( quaternion );
}
OrientationArmModel.prototype.setHeadPosition = function( position ){

	this.headPos.copy( position );
}
OrientationArmModel.prototype.setLeftHanded = function( isLeftHanded ){//  TODO(smus): Implement me!

	this.isLeftHanded = isLeftHanded;
}


/**
 * Called on a RAF.
 */
OrientationArmModel.prototype.update = function(){

	this.time = performance.now();


	//  If the controller’s angular velocity is above a certain amount,
	//  we can assume torso rotation and move the elbow joint relative
	//  to the camera orientation.

	var
	headYawQ = this.getHeadYawOrientation_(),
	timeDelta = (this.time - this.lastTime) / 1000,
	angleDelta = this.quatAngle_( this.lastControllerQ, this.controllerQ ),
	controllerAngularSpeed = angleDelta / timeDelta;

	if( controllerAngularSpeed > OrientationArmModel.MIN_ANGULAR_SPEED ){

		this.rootQ.slerp( headYawQ, angleDelta / 10 );// Attenuate the Root rotation slightly.
	}
	else this.rootQ.copy( headYawQ );


	// We want to move the elbow up and to the center as the user points the
	// controller upwards, so that they can easily see the controller and its
	// tool tips.
	var controllerEuler = new THREE.Euler().setFromQuaternion(this.controllerQ, 'YXZ');
	var controllerXDeg = THREE.Math.radToDeg(controllerEuler.x);
	var extensionRatio = this.clamp_((controllerXDeg - 11) / (50 - 11), 0, 1);

	// Controller orientation in camera space.
	var controllerCameraQ = this.rootQ.clone().inverse();
	controllerCameraQ.multiply(this.controllerQ);

	// Calculate elbow position.
	var elbowPos = this.elbowPos;
	elbowPos.copy(this.headPos).add(OrientationArmModel.HEAD_ELBOW_OFFSET);
	var elbowOffset = new THREE.Vector3().copy(OrientationArmModel.ARM_EXTENSION_OFFSET);
	elbowOffset.multiplyScalar(extensionRatio);
	elbowPos.add(elbowOffset);

	// Calculate joint angles. Generally 40% of rotation applied to elbow, 60%
	// to wrist, but if controller is raised higher, more rotation comes from
	// the wrist.
	var totalAngle = this.quatAngle_(controllerCameraQ, new THREE.Quaternion());
	var totalAngleDeg = THREE.Math.radToDeg(totalAngle);
	var lerpSuppression = 1 - Math.pow(totalAngleDeg / 180, 4); // TODO(smus): ???

	var elbowRatio = OrientationArmModel.ELBOW_BEND_RATIO;
	var wristRatio = 1 - OrientationArmModel.ELBOW_BEND_RATIO;
	var lerpValue = lerpSuppression *
			(elbowRatio + wristRatio * extensionRatio * OrientationArmModel.EXTENSION_RATIO_WEIGHT);

	var wristQ = new THREE.Quaternion().slerp(controllerCameraQ, lerpValue);
	var invWristQ = wristQ.inverse();
	var elbowQ = controllerCameraQ.clone().multiply(invWristQ);

	// Calculate our final controller position based on all our joint rotations
	// and lengths.
	/*
	position_ =
		root_rot_ * (
			controller_root_offset_ +
2:      (arm_extension_ * amt_extension) +
1:      elbow_rot * (kControllerForearm + (wrist_rot * kControllerPosition))
		);
	*/
	var wristPos = this.wristPos;
	wristPos.copy(OrientationArmModel.WRIST_CONTROLLER_OFFSET);
	wristPos.applyQuaternion(wristQ);
	wristPos.add(OrientationArmModel.ELBOW_WRIST_OFFSET);
	wristPos.applyQuaternion(elbowQ);
	wristPos.add(this.elbowPos);

	var offset = new THREE.Vector3().copy(OrientationArmModel.ARM_EXTENSION_OFFSET);
	offset.multiplyScalar(extensionRatio);

	var position = new THREE.Vector3().copy(this.wristPos);
	position.add(offset);
	position.applyQuaternion(this.rootQ);

	var orientation = new THREE.Quaternion().copy(this.controllerQ);


	//  Set the resulting pose orientation and position.

	this.pose.orientation.copy( orientation );
	this.pose.position.copy( position );

	this.lastTime = this.time;
}




//  GETTERS.
//  Returns the pose calculated by the model.

OrientationArmModel.prototype.getPose = function(){

	return this.pose;
}


//  Debug methods for rendering the arm model.

OrientationArmModel.prototype.getForearmLength = function(){

	return OrientationArmModel.ELBOW_WRIST_OFFSET.length();
}
OrientationArmModel.prototype.getElbowPosition = function(){

	var out = this.elbowPos.clone();

	return out.applyQuaternion( this.rootQ );
}
OrientationArmModel.prototype.getWristPosition = function(){

	var out = this.wristPos.clone();

	return out.applyQuaternion( this.rootQ );
}
OrientationArmModel.prototype.getHeadYawOrientation_ = function(){

	var
	headEuler = new THREE.Euler().setFromQuaternion( this.headQ, 'YXZ' ),
	destinationQ;

	headEuler.x  = 0;
	headEuler.z  = 0;
	destinationQ = new THREE.Quaternion().setFromEuler( headEuler );
	return destinationQ;
}


//  General tools...

OrientationArmModel.prototype.clamp_ = function( value, min, max ){

	return Math.min( Math.max( value, min ), max );
}
OrientationArmModel.prototype.quatAngle_ = function( q1, q2 ){

	var
	vec1 = new THREE.Vector3( 0, 0, -1 ),
	vec2 = new THREE.Vector3( 0, 0, -1 );

	vec1.applyQuaternion( q1 );
	vec2.applyQuaternion( q2 );
	return vec1.angleTo( vec2 );
}
