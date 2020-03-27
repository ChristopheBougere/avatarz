const AWS = require('aws-sdk');

class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.tableName = process.env.ROOMS_TABLE;
    this.documentClient = new AWS.DynamoDB.DocumentClient();
  }

  static participantsObjToArray(participants, selfId) {
    return Object.keys(participants)
      .filter(p => participants[p] === true)
      .filter(p => p !== selfId)
    ;
  }

  async createRoomIfNotExists() {
    console.log(`Creating room ${this.roomId} if not exists...`);
    try {
      await this.documentClient.put({
        TableName: this.tableName,
        Item: {
          id: this.roomId,
          participants: {},
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }).promise();
    } catch (e) {
      console.log('Room already exists.');
      if (e.name !== 'ConditionalCheckFailedException') {
        throw e;
      }
    }
    console.log('Done.')
  }

  async addParticipant(participantId) {
    await this.createRoomIfNotExists();
    console.log(`Adding participant ${participantId} to room ${this.roomId}...`);
    const { Attributes: { participants } } = await this.documentClient.update({
      TableName: this.tableName,
      Key: {
        id: this.roomId
      },
      UpdateExpression: 'set participants.#id = :true',
      ExpressionAttributeNames: {
        '#id': participantId,
      },
      ExpressionAttributeValues: {
        ':true': true,
      },
      ReturnValues: 'ALL_NEW',
    }).promise();
    console.log(`Done. Participants in room: ${JSON.stringify(participants, null, 2)}`);
    return Room.participantsObjToArray(participants, participantId);
  }

  async removeParticipant(participantId) {
    console.log(`Removing participant ${participantId} from room ${this.roomId}...`);
    const { Attributes: { participants } } = await this.documentClient.update({
      TableName: this.tableName,
      Key: {
        id: this.roomId
      },
      UpdateExpression: 'set participants.#id = :false',
      ExpressionAttributeNames: {
        '#id': participantId,
      },
      ExpressionAttributeValues: {
        ':false': false,
      },
      ReturnValues: 'ALL_NEW',
    }).promise();
    console.log(`Done. Remainng participants in room: ${JSON.stringify(participants, null, 2)}`);
    return Room.participantsObjToArray(participants, participantId);
  }

  async getParticipants(selfId) {
    const { Item: { participants } } = await this.documentClient.get({
      TableName: this.tableName,
      Key: {
        id: this.roomId
      },
      ConsistentRead: true,
    }).promise();
    return Room.participantsObjToArray(participants, selfId);
  }
}

module.exports = Room;
