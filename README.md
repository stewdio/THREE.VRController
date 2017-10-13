

THREE.VRController
==============================================================================

![THREE.VRController](https://github.com/stewdio/THREE.VRController/raw/master/VRController.png "THREE.VRController")

__Support hand controllers for Oculus, Vive, Daydream, GearVR, Microsoft Mixed
Reality, and more by adding VRController to your existing 
[Three.js](https://threejs.org/)-based 
[WebVR](https://webvr.rocks/) project.__
VRController wraps the [Web Gamepad API](https://www.w3.org/TR/gamepad/), 
handles [gamepad browser quirks](https://medium.com/@stew_rtsmith/webvr-controllers-and-chromiums-gamepad-api-6c9adc633f38),
emits a controller instance (an extended `THREE.Object3D`) upon gamepad 
discovery, handles controller updates for position and orientation—including
3[DOF](https://en.wikipedia.org/wiki/Degrees_of_freedom_(mechanics)) rigs
via the `OrientationArmModel`—and watches for updates on axes and button 
states—emitting corresponding events on the controller instance.
(Pretty great, right?!)

VRController includes explicit support for
[Oculus Rift + Touch](https://www.oculus.com/rift/),
[HTC Vive](https://www.vive.com),
[Windows Mixed Reality motion controllers](https://www.microsoft.com/en-us/windows/windows-mixed-reality),
[Google Daydream](https://vr.google.com/daydream/),
and has implicit support for
[Samsung GearVR](http://www.samsung.com/GearVR)
and similar devices. Is your company developing new hand controllers? Send
them my way and I’ll add support for it. 😉

VRController is compatible with Three.js __r87__ which is the first version to
use the new `renderer.vr` object and was originally submitted to
[Three.js](https://github.com/mrdoob/three.js/) as
[pull request #10991](https://github.com/mrdoob/three.js/pull/10991)
on Saturday, 11 March 2017. Note: that pull request is no longer maintained.


Requirements
------------------------------------------------------------------------------
1. Virtual Reality rig with 3DOF or 6DOF controllers such as the
[Oculus Rift + Touch](https://www.oculus.com/rift/),
[HTC Vive](https://www.vive.com/),
a [Windows Mixed Reality](https://www.microsoft.com/en-us/windows/windows-mixed-reality) rig,
[Google Daydream](https://vr.google.com/daydream/),
[Samsung GearVR](http://www.samsung.com/GearVR), or similar devices.
2. WebVR-capable browser. For the latest list of browsers
that support WebVR—as well as download and setup instructions—see
[WebVR Rocks](https://webvr.rocks/).
3. Working knowledge of [Three.js](https://threejs.org/).


Try it now!
------------------------------------------------------------------------------
Already on a VR rig with a WebVR-capable browser? Just point your browser to
[https://stewdio.github.io/THREE.VRController/](https://stewdio.github.io/THREE.VRController/)
to experience this code in action.


Do it yourself
------------------------------------------------------------------------------
1. Add our
[VRController.js](https://github.com/stewdio/THREE.VRController/raw/master/VRController.js) file to your existing Three.js project and use our
[index.html](https://github.com/stewdio/THREE.VRController/raw/master/index.html)
example file as your guide for the following steps.
2. Add a `THREE.VRController.update()` function call to your animation loop.
3. Add a listener for the `"vr controller connected"` global event. This is
how you will receive the controller object instance—which is an extended
`THREE.Object3D`. This means you can add it to your scene, attach meshes
to it, and so on.
4. When you receive the controller object instance you must give it some
additional information depending on the type of controller. For 6DOF (room
scale) rigs you must provide a standing matrix, easily obtained from your
`WebGLRenderer` instance in Three.js __r87__ and above. This will look similar to:
`controller.standingMatrix = renderer.vr.getStandingMatrix()`.
For 3DOF (seated) rigs you must provide a reference to the camera so the
controller can use the headset’s live position and orientation to guess where
it ought to be: `controller.head = camera`. There’s no penalty for providing
the controller instance with both `standingMatrix` and `head` properties as
we do in the
[example](https://github.com/stewdio/THREE.VRController/raw/master/index.html).
5. Explore the available touch, press, and trackpad events by assigning
`THREE.VRController.verbosity = 1`.
You’ll now see a flood of verbose comments in the JavaScript console as you
interact with your controller. To access controllers directly from the console
explore the `THREE.VRController.controllers` object.


Run locally
------------------------------------------------------------------------------
For security reasons you can’t run a WebVR experience by just dragging the
`index` file onto a browser tab. You have to run an actual server. The easiest
way to do this on your own desktop machine is to start a simple Python server.
Open up a
[command line prompt](https://en.wikipedia.org/wiki/Command-line_interface),
navigate to wherever you’ve stored this code package, then type the
following command depending on the version of
[Python](https://en.wikipedia.org/wiki/Python_(programming_language)) you have
installed.  

Python 2: `python -m SimpleHTTPServer 8000`  
Python 3: `py -m http.server 8000`  

In your browser you can now navigate to
[http://localhost:8000/](http://localhost:8000/) to see the demo running
locally. You can shutdown the local server by returning to the command line
and hitting Control + C.


Notes on Chromium’s Gamepad API
------------------------------------------------------------------------------
If you’re building WebVR experiences and targeting the
[WebVR build of Chromium](https://webvr.info/get-chrome/) you may want to read
my Medium post about its quirky behavior and how VRController compensates for
it: [WebVR controllers and Chromium’s Gamepad API](https://medium.com/@stew_rtsmith/webvr-controllers-and-chromiums-gamepad-api-6c9adc633f38).
