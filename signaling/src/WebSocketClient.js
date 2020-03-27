const AWS = require('aws-sdk');
const User = require('./User');

class WebSocketClient {
  setup(config) {
    if (this.client) {
      console.log('ApiGatewayManagementApi client already initialized.');
      return;
    }
    const { requestContext: { domainName, stage } } = config;
    const endpoint = `https://${domainName}/${stage}`;
    this.client = new AWS.ApiGatewayManagementApi({
      endpoint: endpoint,
    });
    console.log(`ApiGatewayManagementApi client initialized with endpoint ${endpoint}`);
  }

  async send(connectionId, event, payload) {
    if (!this.client) {
      throw new Error('CLIENT_NOT_INITIALIZED');
    }
    console.log(`Sending event ${event} to ${connectionId}. Payload: ${JSON.stringify(payload, null, 2)}`);
    try {
      await this.client.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          event,
          payload,
        }),
      }).promise();
    } catch (err) {
      console.error('Unable to send message:', err);
      if (err.statusCode === 410) {
        const user = new User(connectionId);
        await user.leaveAllRooms();
      }
    }
  }
}

module.exports = WebSocketClient;
