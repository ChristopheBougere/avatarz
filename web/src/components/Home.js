import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { generateId, rgbToRgba } from '../utils';
import { colors } from '../style';
import GitHubCorner from './GitHubCorner';
import background from './background.png';

const ID_LENGTH = 5;
const ID_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const Home = () => {
  const history = useHistory();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState(queryString.parse(location.search).roomId || '');

  const joinRoom = (roomId) => {
    if (!userName.length) {
      message.error('Please fill in a nickname.');
      return;
    }
    history.push(`/rooms/${roomId}?nickname=${encodeURI(userName)}`);
  };

  const joinExistingRoom = () => {
    if (roomId.length !== ID_LENGTH || !roomId.split('').every(character => ID_CHARACTERS.includes(character))) {
      message.error('Room ID must be 5 characters long and only contain capital letters.')
      return;
    }
    joinRoom(roomId);
  };

  const createRoom = () => joinRoom(generateId(ID_CHARACTERS, ID_LENGTH));

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundImage: `url(${background})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <GitHubCorner />
      <div style={{
        borderRadius: 16,
        padding: '0 32px 32px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: colors.yellow,
        filter: `drop-shadow(0 0 0.5em ${rgbToRgba(
          colors.black,
          0.5,
        )})`,
      }}>
        <img src="/logo192.png" width={192} height={192} alt="Avatarz Logo" />
        <p style={{
          color: colors.orange,
          textAlign: 'center',
          fontSize: 'large',
        }}>
          Attend online meetings...<br />in augmented reality!
        </p>
        <div style={{
          marginTop: 16,
        }}>
          <div>
            <Input placeholder="Nickname" onChange={({ target: { value } }) => setUserName(value)} />
          </div>
          <br />
          <div style={{ display: 'flex' }}>
            <Input placeholder="Room ID" onChange={({ target: { value } }) => setRoomId(value)} defaultValue={roomId} />
            <Button type="primary" style={{ marginLeft: 16 }} onClick={joinExistingRoom}>Join existing room</Button>
          </div>
          <div style={{ textAlign: 'center' }}>or</div>
          <Button type="primary" style={{ width: '100%' }} onClick={createRoom}>Create a room</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
