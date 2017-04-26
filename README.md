

THREE.VRController
==============================================================================

![THREE.VRController](https://github.com/stewdio/THREE.VRController/raw/master/VRController.png "THREE.VRController")

__Generic VR controller handler for building [WebVR](https://webvr.rocks/) 
experiences with [THREE.js](https://threejs.org/).__ 
Wraps the [Web Gamepad API](https://www.w3.org/TR/gamepad/) to handle gamepad
discovery, emits a controller (`THREE.Object3D`) instance upon discovery, 
handles controller updates for position and orientation (including 
3[DOF](https://en.wikipedia.org/wiki/Degrees_of_freedom_(mechanics)) rigs
via the `OrientationArmModel`). Watches for updates on axes and button states
and emits corresponding events on the controller instance. Good for 
[HTC Vive](https://www.vive.com), [Oculus Rift](https://www.oculus.com/rift/), 
[Google Daydream](https://vr.google.com/daydream/), and beyond. Just include 
`THREE.VRController.update()` in your animation loop and you’re good to go.
Submitted to [Three.js](https://github.com/mrdoob/three.js/) as 
[pull request #10991](https://github.com/mrdoob/three.js/pull/10991)
on Saturday, 11 March 2017.


Requirements
------------------------------------------------------------------------------
1. Virtual Reality rig with controllers such as the 
[HTC Vive](https://www.vive.com/),
[Oculus Rift](https://www.oculus.com/rift/),
[Google Daydream](https://vr.google.com/daydream/), or similar devices.
2. WebVR-capable browser. For the latest list of browsers
that support WebVR — as well as download and setup instructions — see 
[WebVR Rocks](https://webvr.rocks/).
3. Working knowledge of [THREE.js](https://threejs.org/).


Try it now!
------------------------------------------------------------------------------
Already on a VR rig with a WebVR-capable browser? Just point your browser to
[https://stewdio.github.io/THREE.VRController/](https://stewdio.github.io/THREE.VRController/)
to experience this code in action.


Run locally
------------------------------------------------------------------------------
The easiest way to fire this up on your own desktop machine is to start a 
simple Python server. Open up a 
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



