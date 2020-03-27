const WebSocketClient = require('./WebSocketClient');
const Room = require('./Room');
const User = require('./User');

function logEvent(eventName, event, context) {
  console.log(`"${eventName}" received`);
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
}

function getConnectionIdFromEvent(event) {
  const { requestContext: { connectionId } } = event;
  return connectionId;
}

const success = {
  statusCode: 200,
};

const wsClient = new WebSocketClient();

async function onConnect(event, context) {
  logEvent('onConnect', event, context);
  console.log('Connected');
  return success;
}

async function onDisconnect(event, context) {
  logEvent('onDisconnect', event, context);
  wsClient.setup(event);
  const userId = getConnectionIdFromEvent(event);
  const user = new User(userId);
  const rooms = await user.leaveAllRooms();
  const tasks = [];
  for (let room of rooms) {
    tasks.push(...room.participants.map((user) => wsClient.send(user, 'userLeft', {
      userId: userId,
      roomId: room.roomId,
    })));
  }
  await Promise.all(tasks);
  console.log('Disonnected');
  return success;
}

async function onMessage(event, context) {
  logEvent('onMessage', event, context);
  wsClient.setup(event);
  const connectionId = getConnectionIdFromEvent(event);

  const { event: socketEvent, payload } = JSON.parse(event.body);
  switch (socketEvent) {
    case 'joinRoom': {
      const room = new Room(payload.roomId);
      const participants = await room.addParticipant(connectionId);
      await wsClient.send(connectionId, 'roomJoined', {
        userIds: participants,
        roomId: payload.roomId,
      });
      await Promise.all(
        participants.map(p => wsClient.send(p, 'userJoined', {
          userId: connectionId,
          roomId: payload.roomId,
        })),
      );
      break;
    }
    case 'leaveRoom': {
      const room = new Room(payload.roomId);
      const participants = await room.removeParticipant(connectionId);
      await Promise.all(
        participants.map(p => wsClient.send(p, 'userLeft', {
          userId: connectionId,
          roomId: payload.roomId,
        })),
      );
      break;
    }
    case 'broadcast': {
      const room = new Room(payload.roomId);
      const participants = await room.getParticipants(connectionId);
      await Promise.all(
        participants.map(p => wsClient.send(p, 'message', {
          message: payload.message,
          userId: connectionId,
        })),
      );
      break;
    }
    case 'send': {
      await wsClient.send(payload.userId, 'message', {
        message: payload.message,
        userId: connectionId,
      });
      break;
    }
    default: {
      await wsClient.send(connectionId, 'error', {
        message: 'invalid action type',
      });
      break;
    }
  }
  return success;
}

module.exports = {
  onConnect,
  onDisconnect,
  onMessage,
};
