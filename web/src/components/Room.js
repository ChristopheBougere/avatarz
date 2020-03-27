import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'webrtc-adapter';
import { useHistory, useLocation } from 'react-router-dom';
import { message } from 'antd';
import queryString from 'query-string';
import FaceFilter from '../jeelizFaceFilterES6';
import RoomScene from './RoomScene';

const configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302',
  }],
};

const SIGNALING_URL = process.env.REACT_APP_SIGNALING_URL;

const Room = ({ match: { params: { id: roomId } } }) => {
  const history = useHistory();
  const location = useLocation();

  // state
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [screenStream, setScreenStream] = useState();

  // variables
  const localAudioStreamRef = useRef();
  const screenStreamRef = useRef();
  const socketRef = useRef();
  const usersRef = useRef({});

  const setLocalAndSendMessage = useCallback(
    async (userId, sessionDescription) => {
      await usersRef.current[userId].peerConnection.setLocalDescription(sessionDescription);
      sendSocket('send', {
        userId,
        message: usersRef.current[userId].peerConnection.localDescription,
      });
    },
    [],
  );

  const onMessage = useCallback(
    async (userId, message) => {
      const { type } = message;
      const peerConnection = usersRef.current[userId].peerConnection;
      console.log(`Received message from user ${userId}: ${JSON.stringify(message, null, 2)}`);
      switch (type) {
        case 'userName':
          console.log(`new peer: ${message.userName}/${userId}`);
          usersRef.current[userId] = {
            ...usersRef.current[userId],
            userName: message.userName,
          };
          setUsers(Object.keys(usersRef.current));
        break;
        case 'offer':
          peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          try {
            const sessionDescription = await peerConnection.createAnswer();
            setLocalAndSendMessage(userId, sessionDescription);
          } catch (e) {
            console.error('Failed to create answer', e);
          }
          break;
        case 'answer':
          peerConnection.setRemoteDescription(new RTCSessionDescription(message));
          break;
        case 'candidate':
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate,
          });
          try {
            await peerConnection.addIceCandidate(candidate);
          } catch (e) {
            console.error(`Failed to add candidate:`, candidate, e);
          }
          break;
        default:
          console.warn(`Unhandled message type ${type}.`);
      }
    },
    [setLocalAndSendMessage],
  );

  const createOffer = useCallback(
    async (peerConnection, userId) => {
      try {
        const sessionDescription = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        setLocalAndSendMessage(userId, sessionDescription);
      } catch (e) {
        console.error('Failed to create offer', e);
      }
    },
    [setLocalAndSendMessage],
  );

  const createPeerConnection = useCallback(
    async (userId, isInitiator=false) => {
      const peerConnection = new RTCPeerConnection(configuration);
      console.log(`creating peer connection with ${userId}. isInitiator=${isInitiator}`);
      usersRef.current[userId] = {
        peerConnection
      };
      setUsers(Object.keys(usersRef.current));
      peerConnection.onicecandidate = (iceCandidateEvent) => {
        if (iceCandidateEvent.candidate) {
          sendSocket('send', {
            userId,
            message: {
              type: 'candidate',
              label: iceCandidateEvent.candidate.sdpMLineIndex,
              candidate: iceCandidateEvent.candidate.candidate,
            },
          });
        }
      };
      peerConnection.ontrack = (addStreamEvent) => {
        // If there is video, it is a screen sharing
        if (addStreamEvent.streams[0].getVideoTracks().length) {
          screenStreamRef.current = addStreamEvent.streams[0];
          setScreenStream(screenStreamRef.current);
        } else { // Otherwise it is audio
          document.getElementById(`audio-${userId}`).srcObject = addStreamEvent.streams[0];
        }
      };
      peerConnection.onremovestream = () => {
        document.getElementById(`audio-${userId}`).srcObject = null;
      };
      peerConnection.addStream(localAudioStreamRef.current);
      if (screenStreamRef.current) {
        peerConnection.addStream(screenStreamRef.current);
      }
      if (isInitiator) {
        createOffer(peerConnection, userId);
      }
    },
    [createOffer],
  );

  const onRoomJoined = useCallback(
    (userIds) => {
      sendSocket('broadcast', {
        roomId: roomId,
        message: {
          type: 'userName',
          userName,
        },
      });
      userIds.map(userId => createPeerConnection(userId, true));
    },
    [createPeerConnection, roomId, userName],
  );

  const onUserJoined = useCallback(
    (userId) => {
      sendSocket('send', {
        userId,
        message: {
          type: 'userName',
          userName,
        },
      });
      createPeerConnection(userId);
    },
    [createPeerConnection, userName],
  );

  const onUserLeft = useCallback(
    (userId) => {
      if (usersRef.current[userId]) {
        usersRef.current[userId].peerConnection.close();
      }
      delete[usersRef.current.userId];
      setUsers(Object.keys(usersRef.current));
      console.log(`user ${userId} left`);
    },
    [],
  );

  const onSocketMessage = useCallback(
    (e) => {
      const { event, payload } = JSON.parse(e.data);
      switch (event) {
        case 'roomJoined': {
          onRoomJoined(payload.userIds);
          break;
        }
        case 'userJoined': {
          onUserJoined(payload.userId);
          break;
        }
        case 'userLeft': {
          onUserLeft(payload.userId);
          break;
        }
        case 'message': {
          onMessage(payload.userId, payload.message);
          break;
        }
        case 'error': {
          console.error(`Socket error: ${payload.message}`);
          break;
        }
        default: {
          console.error(`Unhandled socket event: ${event}. Payload: ${JSON.stringify(payload, null, 2)}`);
        }
      }
    },
    [onMessage, onRoomJoined, onUserJoined, onUserLeft],
  );

  const initSocket = useCallback(
    async () => {
      localAudioStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      socketRef.current = new WebSocket(SIGNALING_URL);
      socketRef.current.onmessage = onSocketMessage;
      socketRef.current.onopen = () => {
        console.log('Socket is ready');
        sendSocket('joinRoom', {
          roomId,
        });
      };
    },
    [onSocketMessage, roomId],
  );

  const initFaceTracking = useCallback(
    () => {
      console.log('Initializing facefilter...');
      FaceFilter.init({
        canvasId: 'faceFilterCanvas',
        NNCpath: '/',
        callbackReady: (errCode, spec) => {
          if (errCode) {
            console.log(`FaceFilter error: ${errCode}`);
            return;
          }
          console.log('FaceFilter is ready. Spec:', spec);
        },
        callbackTrack: ({ detected, x, y, s, rx, ry, rz, expressions: [ mouthOpeningCoefficient ] }) => {
          // if (detected < 0.5) {
          //   console.log(`faceDetectionProbability=${detected}, too low to continue`);
          //   return;
          // }
          // console.log(`mouthOpeningCoefficient=${mouthOpeningCoefficient}, x=${x}, y=${y}, scale=${s}, rx=${rx}, ry=${ry}, rz=${rz}`);
        },
      });
    },
    [],
  );

  // on mount
  useEffect(() => {
    initSocket();
    initFaceTracking();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const nickname = queryString.parse(location.search).nickname;
    if (nickname) {
      localStorage.setItem('userName', nickname);
      setUserName(nickname);
      history.push();
    } else if (!userName) {
      message.info('Please fill in a name before joining a room.');
      history.push(`/?${queryString.stringify({ roomId })}`);
    }
  }, [location.search, userName, history, roomId]);

  // on unmount
  useEffect(() => () => {
    if (socketRef.current) {
      sendSocket('leaveRoom', {
        roomId,
      });
      Object.values(usersRef.current).forEach(user => user.peerConnection.close());
      socketRef.current.close();
    }
  }, [roomId]);

  // event handlers
  const sendSocket = (event, payload) => {
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn(`Trying to send message on socket with status ${socketRef.current.readyState}`);
      return;
    }
    socketRef.current.send(JSON.stringify({
      event,
      payload,
    }));
  };

  const onScreenClick = async () => {
    console.log(screenStreamRef.current)
    if (!screenStreamRef.current) {
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // No audio for now
      });
      setScreenStream(screenStreamRef.current);
      console.log(screenStreamRef.current)

      for (let userId in usersRef.current) {
        usersRef.current[userId].peerConnection.addStream(screenStreamRef.current);
        createOffer(usersRef.current[userId].peerConnection, userId);
      }

    } else {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
    }
  };
  const usersWithSelf = [{
    id: 'self',
    userName,
  }];
  usersWithSelf.push(...Object.keys(usersRef.current).map(userId => ({
    id: userId,
    userName: usersRef.current[userId].userName,
  })));

  return (
    <div>
      <RoomScene
        onScreenClick={onScreenClick}
        screenStream={screenStream}
        users={usersWithSelf}
      />
      {
        users.map(user =>
          <audio style={{ visibility: 'hidden' }} id={`audio-${user}`} key={`audio-${user}`} autoPlay />
        )
      }
      <canvas id="faceFilterCanvas" style={{ visibility: 'hidden' }}></canvas>
    </div>
  );
};

export default Room;
