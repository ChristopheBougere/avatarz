# Avatarz signaling server

## Deploy
```bash
npx serverless deploy
```

## TODO
- Configure a domain name for the WebSocket API. Waiting for [this PR](https://github.com/amplify-education/serverless-domain-manager/pull/319) to merge.

## Input event types

### `joinRoom`
Will create a room if not exists and add the user.
Example:
```json
{
  "event": "joinRoom",
  "payload": {
    "roomId": "theRoomId"
  }
}
```
Emit:
- `roomJoined`
- `userJoined`

### `leaveRoom`
Remove user from room.
Example:
```json
{
  "event": "leaveRoom",
  "payload": {
    "roomId": "theRoomId"
  }
}
```
Emit:
- `userLeft`

### `broadcast`
Send a message to all users in a room.
Example:
```json
{
  "event": "broadcast",
  "payload": {
    "roomId": "theRoomId",
    "message": {
      "the": "message",
      "to": "broadcast"
    }
  }
}
```
Emit:
- `message`

### `send`
Send a message to a specific user.
Example:
```json
{
  "event": "send",
  "payload": {
    "userId": "userId",
    "message": {
      "the": "message",
      "to": "send"
    }
  }
}
```
Emit:
- `message`

## Output event types

### `roomJoined`
Confirm that user joined the room, and gives active users.
Example:
```json
{
  "event": "roomJoined",
  "payload": {
    "userIds": ["id1", "id2"],
    "roomId": "theRoomId"
  }
}
```

### `userJoined`
Alert users in a room that a new user joined.
Example:
```json
{
  "event": "userJoined",
  "payload": {
    "userId": "newUserId",
    "roomId": "theRoomId"
  }
}
```

### `userLeft`
Alert users in a room that a user left.
Example:
```json
{
  "event": "userLeft",
  "payload": {
    "userId": "oldUserId",
    "roomId": "theRoomId"
  }
}
```

### `message`
Send a message to a user.
Example:
```json
{
  "event": "message",
  "payload": {
    "userId": "emitterUserId",
    "message": {
      "the": "message",
      "to": "send"
    }
  }
}
```

### `error`
An error occured.
Example:
```json
{
  "event": "error",
  "payload": {
    "message": "An error message"
  }
}
```
