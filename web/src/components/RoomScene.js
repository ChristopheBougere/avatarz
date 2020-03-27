import React, { useEffect, useState } from 'react';
import { Entity, Scene } from 'aframe-react';
import { notification } from 'antd';
import 'aframe-extras';

const seats = [{
  position: '-1 0 -0.7',
  rotation: '0 90 0',
}, {
  position: '1 0 -0.7',
  rotation: '0 -90 0',
}, {
  position: '-1 0 -1.8',
  rotation: '0 90 0',
}, {
  position: '1 0 -1.8',
  rotation: '0 -90 0',
}, {
  position: '-0.5 0 0.2',
  rotation: '0 160 0',
}, {
  position: '0.5 0 0.2',
  rotation: '0 200 0',
}];

const getLabelPosition = (position) => {
  const array = position.split(' ');
  array[1] = (Number(array[1]) + 1.5).toString();
  return array.join(' ');
}

const RoomScene = ({
  onScreenClick,
  screenStream,
  users,
}) => {
  // state
  const [cameraRotation, setCameraRotation] = useState('0 0 0');
  const [showTip, setShowTip] = useState(false);

  // effects
  useEffect(() => {
    document.getElementById('screencast').srcObject = screenStream;
  }, [screenStream]);

  useEffect(() => {
    const selfIndex = users.findIndex(user => user.id === 'self');
    const rotation = seats[selfIndex].rotation.split(' ');
    rotation[1] = (Number(rotation[1]) + 180) % 360;
    setCameraRotation(rotation.join(' '));
  }, [setCameraRotation, users]);

  if (!window.AFRAME.components.screen) {
    window.AFRAME.registerComponent('screen', {
      init: function () {
        this.el.addEventListener('click', onScreenClick);
        this.el.addEventListener('mouseenter', () => {
          if (!showTip) {
            setShowTip(true);
            notification.info({
              message: 'Click on the screen to start sharing yours',
              onClose: () => setShowTip(false),
            });
          }
        });
      },
    });
  }
  if (!window.AFRAME.components['rotation-reader']) {
    window.AFRAME.registerComponent('rotation-reader', {
      tick: function () {
        const rotation = this.el.getAttribute('rotation');
        setCameraRotation(`${rotation.x} ${rotation.y} ${rotation.z}`);
      },
    });
  }

  // model: https://sketchfab.com/models/d8ca320050c6494581c34292356a280b
  // TODO what do we do when there isn't enought seats?
  const characters = users.map((user, i) => {
    const res = [
      <Entity
        gltf-model="#male-character"
        key={`character-${user.id}`}
        animation-mixer
        scale="0.01 0.01 0.01"
        position={seats[i].position}
        rotation={seats[i].rotation}
      />,
    ];
    if (user.id !== 'self') {
      res.push(
        <Entity
          key={`character-name-${user.id}`}
          position={getLabelPosition(seats[i].position)}
          rotation={cameraRotation}
        >
          <a-text
            value={user.userName}
            align="center"
          />
        </Entity>
      );
    }
    return res;
  });

  const chairs = seats.map((s, i) => (
    <Entity
      io3d-furniture="id:6d52e73e-43f0-4a6f-868b-fab0c1640050"
      key={`chair-${i}`} position={s.position} rotation={s.rotation}
    />
  ));

  const selfIndex = users.findIndex(user => user.id === 'self');

  return (
    <Scene io3d-lighting cursor="rayOrigin: mouse" vr-mode-ui="enabled: false">
      <a-assets>
        <a-asset-item id="male-character" src="/3d-models/man_sitting/scene.gltf" />
        <video id="screencast" autoPlay loop crossOrigin="*" />
      </a-assets>

      {/* Characters */}
      {characters}

      {/* Chairs */}
      {chairs}

      {/* Floor */}
      <Entity io3d-floor="w:8; l:6; " position="-3 0 -4" />

      {/* Camera */}
      <Entity position={seats[selfIndex].position}>
        <a-camera rotation={cameraRotation} rotation-reader="" wasd-controls="enabled: false" />
      </Entity>

      {/* Walls */}
      <Entity io3d-wall="l: 6; material_back:cabinet_cherry_veneer; material_front:cabinet_cherry_veneer;" position="-3 0 -4" />
      <Entity io3d-wall="l: 6; material_back:cabinet_cherry_veneer; material_front:cabinet_cherry_veneer;" position="-3 0 4" />
      <Entity io3d-wall="l: 8; material_back:cabinet_cherry_veneer; material_front:cabinet_cherry_veneer;" position="-3 0 -4" rotation="0 -90 0" />
      <Entity io3d-wall="l: 8; material_back:cabinet_cherry_veneer; material_front:cabinet_cherry_veneer;" position="3 0 -4" rotation="0 -90 0" />

      {/* TV */}
      <Entity io3d-furniture="id:7c13afd7-3c96-4ecb-9ff4-5b378d81eeca" position="0 0 -3.8" />
      <a-video src="#screencast" width="1.65" height="0.85" position="0 1.285 -3.74" screen="" />

      {/* Table */}
      <Entity io3d-furniture="id:1a1ba0b8-9b7e-42d2-891d-e55cf0dabb01" position="0 0 -1.5" rotation="0 90 0" />

      {/* Babyfoot */}
      <Entity io3d-furniture="id:70d95e22-7150-4721-a4cd-220f8cb4d5c4" position="-1.8 0 3" rotation="0 -30 0" />

      {/* Fireplace */}
      <Entity io3d-furniture="id:f103bb18-96ba-4734-8905-87cd43bfb3ce" position="-3 0 1" rotation="0 90 0" />

      {/* Sofa */}
      <Entity io3d-furniture="id:cdb909c2-4459-438f-83ff-0d3b954b3345" position="1.1 0 2.3" rotation="0 -180 0" />
    </Scene>
  );
};

export default RoomScene
