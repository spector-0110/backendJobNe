# Messaging & Notification API Documentation

Complete guide for Real-time Chat Messaging and Notification Management APIs.

---

## Table of Contents
1. [Messaging APIs](#messaging-apis)
2. [Notification APIs](#notification-apis)
3. [Real-time Socket.IO Events](#real-time-socketio-events)
4. [Testing Workflows](#testing-workflows)

---

## Messaging APIs

### Overview
Real-time chat system allowing connected users to send messages, view conversations, and track message status.

**Requirements:**
- Users must be connected (accepted connection) to send messages
- Messages are delivered instantly via Socket.IO
- Auto-marking messages as read when conversation is opened
- Read receipts sent in real-time

### Message Features
- ✅ Real-time message delivery
- ✅ Read receipts
- ✅ Conversation list with unread counts
- ✅ Message search
- ✅ Mark as read functionality
- ✅ Delete messages (sender only)
- ✅ Multi-device sync

---

### Messaging Endpoints

#### 1. Send Message
```http
POST /api/messages/send
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverId": "673a5f8e2c1d4a5b6c7d8e9f",
  "content": "Hey! How are you doing?"
}
```

**Requirements:**
- Users must be connected (accepted connection)
- Cannot message yourself
- Message content: 1-5000 characters

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "...",
    "senderId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "receiverId": {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "content": "Hey! How are you doing?",
    "isRead": false,
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Real-time Events:**
- Receiver gets `new_message` event
- Sender gets `message_sent` event (for multi-device sync)

**Error Cases:**
- `403 NOT_CONNECTED` - Users are not connected
- `404` - Receiver not found
- `400` - Cannot message yourself

---

#### 2. Get Conversations
```http
GET /api/messages/conversations?page=1&limit=20
Authorization: Bearer <accessToken>
```

Returns list of all conversations with last message and unread count.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "conversations": [
      {
        "userId": "...",
        "user": {
          "_id": "...",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "employer"
        },
        "lastMessage": {
          "content": "Thanks for applying!",
          "senderId": "...",
          "createdAt": "2025-11-23T09:45:00.000Z",
          "isRead": false
        },
        "unreadCount": 3,
        "lastActivity": "2025-11-23T09:45:00.000Z"
      },
      {
        "userId": "...",
        "user": {
          "name": "Bob Johnson",
          "email": "bob@example.com"
        },
        "lastMessage": {
          "content": "See you tomorrow!",
          "senderId": "...",
          "createdAt": "2025-11-22T18:30:00.000Z",
          "isRead": true
        },
        "unreadCount": 0,
        "lastActivity": "2025-11-22T18:30:00.000Z"
      }
    ],
    "count": 2,
    "totalCount": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Features:**
- Sorted by last activity (most recent first)
- Shows unread message count per conversation
- Only includes users you're connected with

---

#### 3. Get Messages with User
```http
GET /api/messages/:userId?page=1&limit=50
Authorization: Bearer <accessToken>
```

Get all messages between you and a specific user.

**Auto-marking:** Automatically marks unread messages as read when fetching.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "messages": [
      {
        "_id": "...",
        "senderId": {
          "_id": "...",
          "name": "John Doe"
        },
        "receiverId": {
          "_id": "...",
          "name": "Jane Smith"
        },
        "content": "Hey! How are you doing?",
        "isRead": true,
        "createdAt": "2025-11-23T10:00:00.000Z",
        "updatedAt": "2025-11-23T10:05:00.000Z"
      },
      {
        "_id": "...",
        "senderId": {
          "name": "Jane Smith"
        },
        "receiverId": {
          "name": "John Doe"
        },
        "content": "I'm great! Thanks for asking.",
        "isRead": false,
        "createdAt": "2025-11-23T10:01:00.000Z"
      }
    ],
    "count": 2,
    "totalCount": 47,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

**Real-time Event:**
- If messages are marked as read, sender receives `messages_read` event with message IDs

**Error Cases:**
- `403` - Not connected with this user

---

#### 4. Mark Message as Read
```http
PUT /api/messages/:id/read
Authorization: Bearer <accessToken>
```

**Rules:**
- Only receiver can mark as read
- Already read messages return without error

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "...",
    "isRead": true,
    "updatedAt": "2025-11-23T10:05:00.000Z"
  }
}
```

**Real-time Event:**
- Sender receives `message_read` event with messageId and readAt timestamp

---

#### 5. Mark All Messages as Read
```http
PUT /api/messages/read-all/:userId
Authorization: Bearer <accessToken>
```

Mark all messages from a specific user as read.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "5 messages marked as read",
    "modifiedCount": 5
  }
}
```

**Real-time Event:**
- Sender receives `messages_read` event

---

#### 6. Get Unread Message Count
```http
GET /api/messages/unread/count
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "unreadCount": 12
  }
}
```

---

#### 7. Search Messages
```http
GET /api/messages/search?q=interview&page=1&limit=20
Authorization: Bearer <accessToken>
```

Search through all your messages.

**Query Parameters:**
- `q` - Search text (required)
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "messages": [
      {
        "_id": "...",
        "senderId": {...},
        "receiverId": {...},
        "content": "The interview is scheduled for tomorrow at 10 AM",
        "createdAt": "2025-11-22T15:00:00.000Z"
      }
    ],
    "count": 1,
    "page": 1,
    "limit": 20,
    "searchText": "interview"
  }
}
```

---

#### 8. Delete Message
```http
DELETE /api/messages/:id
Authorization: Bearer <accessToken>
```

**Rules:**
- Only sender can delete their own messages

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "Message deleted successfully"
  }
}
```

**Real-time Event:**
- Receiver gets `message_deleted` event with messageId

---

## Notification APIs

### Overview
Manage system notifications including new applications, connection requests, application status updates, etc.

### Notification Types
- `connection_request` - Someone sent you a connection request
- `connection_accept` - Your connection request was accepted
- `new_application` - Someone applied to your job posting
- `application_status` - Your application status changed
- `new_message` - New message received (if needed)
- `job_match` - New job matches your profile

### Notification Features
- ✅ Mark individual as read
- ✅ Mark all as read
- ✅ Delete notifications
- ✅ Filter by type and read status
- ✅ Get unread count
- ✅ Statistics by type

---

### Notification Endpoints

#### 1. Get Notifications
```http
GET /api/notifications?type=connection_request&isRead=false&page=1&limit=20
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `type` - Filter by notification type (optional)
- `isRead` - Filter by read status (true/false) (optional)
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "notifications": [
      {
        "_id": "...",
        "userId": "...",
        "type": "connection_request",
        "title": "New Connection Request",
        "message": "John Doe sent you a connection request",
        "relatedId": "...",
        "relatedModel": "Connection",
        "isRead": false,
        "createdAt": "2025-11-23T10:00:00.000Z"
      },
      {
        "_id": "...",
        "type": "application_status",
        "title": "Application Update",
        "message": "Congratulations! You've been shortlisted for Senior Developer",
        "isRead": false,
        "createdAt": "2025-11-23T09:30:00.000Z"
      }
    ],
    "count": 2,
    "totalCount": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### 2. Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "unreadCount": 8
  }
}
```

---

#### 3. Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "...",
    "isRead": true,
    "updatedAt": "2025-11-23T10:05:00.000Z"
  }
}
```

---

#### 4. Mark All Notifications as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "8 notifications marked as read",
    "modifiedCount": 8
  }
}
```

---

#### 5. Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

#### 6. Delete All Read Notifications
```http
DELETE /api/notifications/read
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "12 notifications deleted",
    "deletedCount": 12
  }
}
```

---

#### 7. Delete All Notifications
```http
DELETE /api/notifications/all
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "20 notifications deleted",
    "deletedCount": 20
  }
}
```

---

#### 8. Get Notification Statistics
```http
GET /api/notifications/stats
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "stats": {
      "total": 47,
      "unread": 8,
      "byType": {
        "connection_request": {
          "total": 15,
          "unread": 3
        },
        "connection_accept": {
          "total": 10,
          "unread": 2
        },
        "new_application": {
          "total": 12,
          "unread": 2
        },
        "application_status": {
          "total": 10,
          "unread": 1
        }
      }
    }
  }
}
```

---

## Real-time Socket.IO Events

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

### Message Events

#### Event: `new_message`
Triggered when someone sends you a message.

```javascript
socket.on('new_message', (data) => {
  console.log('New message received:', data);
  // data = {
  //   message: {
  //     _id: '...',
  //     senderId: { name: 'John Doe', ... },
  //     content: 'Hey! How are you?',
  //     isRead: false,
  //     createdAt: '...'
  //   }
  // }
  
  // Update UI: show notification, add to conversation list
});
```

#### Event: `message_sent`
Triggered on sender's devices for multi-device sync.

```javascript
socket.on('message_sent', (data) => {
  // Sync message across all your devices
  // data.message = sent message object
});
```

#### Event: `message_read`
Triggered when receiver reads your message.

```javascript
socket.on('message_read', (data) => {
  // data = {
  //   messageId: '...',
  //   readBy: 'userId',
  //   readAt: '2025-11-23T10:05:00.000Z'
  // }
  
  // Update UI: show read receipt (double check mark)
});
```

#### Event: `messages_read`
Triggered when receiver marks multiple messages as read.

```javascript
socket.on('messages_read', (data) => {
  // data = {
  //   messageIds: ['id1', 'id2', ...],
  //   readBy: 'userId'
  // }
  // OR
  // data = {
  //   readBy: 'userId',
  //   conversationWith: 'userId'
  // }
});
```

#### Event: `message_deleted`
Triggered when sender deletes a message.

```javascript
socket.on('message_deleted', (data) => {
  // data = {
  //   messageId: '...',
  //   conversationWith: 'userId'
  // }
  
  // Update UI: remove message from conversation
});
```

---

### Notification Events

#### Event: `notification`
Universal notification event for all system notifications.

```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  
  switch(data.type) {
    case 'connection_request':
      // data = {
      //   type: 'connection_request',
      //   notification: {
      //     title: 'New Connection Request',
      //     message: 'John Doe sent you a connection request',
      //     ...
      //   },
      //   connection: { full connection object }
      // }
      break;
      
    case 'connection_accept':
      // Connection was accepted
      break;
      
    case 'new_application':
      // data.application = full application object
      break;
      
    case 'application_status':
      // Application status changed
      break;
  }
  
  // Update UI: show toast notification, update notification bell count
});
```

---

### Typing Indicator (Already in Socket Handler)

#### Emit: `typing_start`
```javascript
socket.emit('typing_start', {
  receiverId: 'userId'
});
```

#### Emit: `typing_stop`
```javascript
socket.emit('typing_stop', {
  receiverId: 'userId'
});
```

#### Listen: `user_typing`
```javascript
socket.on('user_typing', (data) => {
  // data = { userId: '...', userName: 'John Doe' }
  // Show "John is typing..." indicator
});
```

#### Listen: `user_stopped_typing`
```javascript
socket.on('user_stopped_typing', (data) => {
  // Hide typing indicator
});
```

---

### Presence Events

#### Listen: `user_online`
```javascript
socket.on('user_online', (data) => {
  // data = { userId: '...' }
  // Update UI: show user as online (green dot)
});
```

#### Listen: `user_offline`
```javascript
socket.on('user_offline', (data) => {
  // data = { userId: '...' }
  // Update UI: show user as offline (grey dot)
});
```

---

## Testing Workflows

### Workflow 1: Real-time Chat

**Step 1: User A Connects to Socket.IO**
```javascript
const socketA = io('http://localhost:4000', {
  auth: { token: USER_A_TOKEN }
});

socketA.on('new_message', (data) => {
  console.log('Message received:', data.message);
});
```

**Step 2: User B Connects to Socket.IO**
```javascript
const socketB = io('http://localhost:4000', {
  auth: { token: USER_B_TOKEN }
});

socketB.on('message_sent', (data) => {
  console.log('Message sent confirmation:', data.message);
});
```

**Step 3: User B Sends Message**
```bash
curl -X POST http://localhost:4000/api/messages/send \
  -H "Authorization: Bearer USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "USER_A_ID",
    "content": "Hey! Are you available for a quick chat?"
  }'
```

**Step 4: User A Receives Real-time Notification**
```javascript
// User A's socket automatically receives:
{
  message: {
    senderId: { name: 'User B' },
    content: 'Hey! Are you available for a quick chat?',
    isRead: false
  }
}
```

**Step 5: User A Views Conversation**
```bash
curl -X GET http://localhost:4000/api/messages/USER_B_ID \
  -H "Authorization: Bearer USER_A_TOKEN"
```

**Step 6: User B Receives Read Receipt**
```javascript
// User B's socket automatically receives:
socketB.on('messages_read', (data) => {
  // Messages marked as read by User A
});
```

**Step 7: User A Replies**
```bash
curl -X POST http://localhost:4000/api/messages/send \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "USER_B_ID",
    "content": "Yes, I am! What'\''s up?"
  }'
```

---

### Workflow 2: Notification Management

**Step 1: Get All Unread Notifications**
```bash
curl -X GET "http://localhost:4000/api/notifications?isRead=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 2: Get Unread Count (for badge)**
```bash
curl -X GET http://localhost:4000/api/notifications/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3: Mark Specific Notification as Read**
```bash
curl -X PUT http://localhost:4000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 4: Mark All as Read**
```bash
curl -X PUT http://localhost:4000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 5: Delete Read Notifications**
```bash
curl -X DELETE http://localhost:4000/api/notifications/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 6: Get Notification Statistics**
```bash
curl -X GET http://localhost:4000/api/notifications/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Workflow 3: Conversation Management

**Step 1: Get All Conversations**
```bash
curl -X GET http://localhost:4000/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 2: Get Unread Message Count**
```bash
curl -X GET http://localhost:4000/api/messages/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3: Open Conversation with User**
```bash
curl -X GET http://localhost:4000/api/messages/USER_ID?page=1&limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 4: Search Messages**
```bash
curl -X GET "http://localhost:4000/api/messages/search?q=interview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 5: Delete Sent Message**
```bash
curl -X DELETE http://localhost:4000/api/messages/MESSAGE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Integration Guide

### Frontend Integration

#### React Example - Message Component
```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ currentUserId, otherUserId, token }) {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:4000', {
      auth: { token }
    });

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      if (data.message.senderId._id === otherUserId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Listen for read receipts
    newSocket.on('message_read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token, otherUserId]);

  const sendMessage = async (content) => {
    const response = await fetch('http://localhost:4000/api/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receiverId: otherUserId, content })
    });
    
    const data = await response.json();
    setMessages(prev => [...prev, data.data]);
  };

  return (
    <div>
      {/* Render messages */}
      {messages.map(msg => (
        <div key={msg._id}>
          <p>{msg.content}</p>
          {msg.senderId._id === currentUserId && (
            <span>{msg.isRead ? '✓✓' : '✓'}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## API Summary

### Messages (8 endpoints)
- ✅ POST `/api/messages/send` - Send message (real-time)
- ✅ GET `/api/messages/conversations` - Get conversation list
- ✅ GET `/api/messages/:userId` - Get messages with user (auto-mark as read)
- ✅ PUT `/api/messages/:id/read` - Mark message as read
- ✅ PUT `/api/messages/read-all/:userId` - Mark all as read
- ✅ GET `/api/messages/unread/count` - Get unread count
- ✅ GET `/api/messages/search` - Search messages
- ✅ DELETE `/api/messages/:id` - Delete message

### Notifications (8 endpoints)
- ✅ GET `/api/notifications` - Get notifications (with filters)
- ✅ GET `/api/notifications/unread/count` - Get unread count
- ✅ GET `/api/notifications/stats` - Get statistics
- ✅ PUT `/api/notifications/:id/read` - Mark as read
- ✅ PUT `/api/notifications/read-all` - Mark all as read
- ✅ DELETE `/api/notifications/:id` - Delete notification
- ✅ DELETE `/api/notifications/read` - Delete all read
- ✅ DELETE `/api/notifications/all` - Delete all

---

## Real-time Events Summary

### Messaging Events
- `new_message` - Receive message instantly
- `message_sent` - Multi-device sync
- `message_read` - Single message read receipt
- `messages_read` - Multiple messages read receipt
- `message_deleted` - Message deletion notification

### Notification Events
- `notification` - Universal notification event for all types

### Presence Events
- `user_online` - User comes online
- `user_offline` - User goes offline
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing

---

**Total Backend Endpoints: 73** 🎉
- Auth: 4
- Files: 4
- Job Seeker: 12
- Employer: 11
- Assessment: 6
- Jobs: 8
- Applications: 9
- Connections: 11
- Messages: 8
- Notifications: 8

**JobNest Backend is Complete! 🚀**
