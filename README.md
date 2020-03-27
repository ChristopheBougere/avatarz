# Avatarz - Attend online meetings in augmented reality

Current videoconferencing tools are nonsense: they make you send gigabytes of HD video that contain just a few relevant information. What if, instead of directly sending the video from your webcam, you were only sending your face expression and your lips movements? Then, we could render this on 3D avatars that we would place in a virtual meeting room.

This repository hosts the code of a proof of concept of the above idea, which has been [submitted](https://devpost.com/software/avatarz-wharxp) to [COVID-19 Global Hackathon](https://covid-global-hackathon.devpost.com).

**Features**
- Create and join a room
- Speak with your peers (audio channel)
- Share your screen with your peers on the TV
- View people through a 3D avatar
- Real-time face detection and mouth opening coefficient computation (using webcam stream)

**Not implemented yet**
- Share FaceFilter result (face motion and mouth opening coefficient) to peers through WebRTC data channel
- Render motion on avatars head, and render lip-sync ([could be computed at runtime using aframe-extras](https://stackoverflow.com/questions/43645425/how-to-implement-complex-models-in-aframe/43647655#43647655)).

**Ideas**
- Users should be assigned a seat in a deterministic way, so everybody see the same result.
- Unicode not working in `<a-text>` (see [this](https://aframe.io/docs/0.8.0/components/text.html#limitations)). Need to find an alternative (generate custom font, or render an image).
- Design more rooms with different capabilities/ambiances (auditorium, classroom, lounge, ...), and give the choice to the user.
- Add more characters, and give the choice to the user. Might use [meshConverter](https://github.com/jeeliz/jeelizWeboji/tree/master/meshConverter), [FBX2glTF](https://github.com/facebookincubator/FBX2glTF) or [COLLADA2GLTF](https://github.com/KhronosGroup/COLLADA2GLTF).
- Detect the current speaker, add an arrow on top of it.
- Ability to see shared screen in full screen, or open it in a resizable popup.
- Voice sound level could depend on distance with other people.
- WebGL consumes lot of resources in the browser. Maybe we could leverage WebWorkers for face tracking inference?
- Only display character faces in mobile mode to improve usability and performances.

While we have a bunch of good ideas to make Avatarz a really cool tool, we don't have the required skills in 3D to render expressions on avatars. We would love to get contributions from anyone willing to help!

## Interesting readings/videos

### Videoconferencing
- [A New Kind of Social Network: Emotional Intelligence](https://medium.com/hackernoon/a-new-kind-of-social-network-emotional-intelligence-e45dcddb1bdb#d97f)
- [Facebook Social VR Demo - Oculus Connect 2016](https://www.youtube.com/watch?v=YuIgyKLPt3s)
- [Wired - Second Life Interviews Mean Real Life Jobs](https://www.wired.com/2007/08/second-life-int/)
- [NPR - Virtual Recruiting for Real-World Jobs](https://www.npr.org/templates/story/story.php?storyId=13851345)
- [Facebook is building the future of connection with lifelike avatars](https://tech.fb.com/codec-avatars-facebook-reality-labs/)

### Motion detection
- [Banuba Face Filters SDK](https://www.banuba.com/facear-sdk/face-filters)
- [Jeeliz Weboji](https://github.com/jeeliz/jeelizWeboji)
- [Jeeliz FaceFilter](https://github.com/jeeliz/jeelizFaceFilter)
- [AI-Based Animoji Without The iPhone X](https://www.youtube.com/watch?v=UPcR7S8ue1A)
- [SUPERMOJI - the Emoji App](https://apps.apple.com/fr/app/supermoji-the-emoji-app/id1300364926)
- [Deep Learning in your Browser: powered by WebGL](https://fr.slideshare.net/ocampesato/deep-learning-in-your-browser-powered-by-webgl)

### WebRTC
- [WebRTC tutorial](https://codelabs.developers.google.com/codelabs/webrtc-web)
- [Understanding SFU (Selective Forwarding Unit)](https://webrtcglossary.com/sfu/)

### 3D
- [Creating animated glTF Characters with Mixamo and Blender](https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/)
- [Skinning and morphing with WebGL in three.js](https://threejs.org/examples/#webgl_animation_skinning_morph)
