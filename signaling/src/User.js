const AWS = require('aws-sdk');
const Room = require('./Room');

class User {
  constructor(userId) {
    this.userId = userId;
    this.tableName = process.env.ROOMS_TABLE;
    this.documentClient = new AWS.DynamoDB.DocumentClient();
  }

  async getParticipatingRooms() {
    let lastEvaluatedKey;
    const rooms = [];
    do {
      const { LastEvaluatedKey, Items } = await this.documentClient.scan({
        TableName: this.tableName,
        FilterExpression: 'participants.#id = :true',
        ExpressionAttributeNames: {
          '#id': this.userId,
        },
        ExpressionAttributeValues: {
          ':true': true,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }).promise();
      lastEvaluatedKey = LastEvaluatedKey;
      rooms.push(...(Items.map(i => i.id)));
    } while(lastEvaluatedKey);
    console.log(`User ${this.userId} is participating in rooms ${JSON.stringify(rooms)}`);
    return rooms;
  }

  async leaveRoom(roomId) {
    const room = new Room(roomId);
    const participants = await room.removeParticipant(this.userId);
    console.log(`User ${this.userId} left room ${roomId}`);
    return participants;
  }

  async leaveAllRooms() {
    const rooms = await this.getParticipatingRooms();
    const res = await Promise.all(rooms.map(async (roomId) => {
      return {
        roomId: roomId,
        participants: await this.leaveRoom(roomId),
      }
    }));
    console.log(`User ${this.userId} left all rooms`);
    return res;
  }
}

module.exports = User;
