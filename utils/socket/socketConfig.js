const { io } = require('../../bin/www'); // Import io from the main script

const conversationSocketsMap = {};
/*
io.on("connect", async function (socket) {
  socket.on("user_connected", (data) => {
    console.log("User connected:", data);
    const currentUserIndex = onlineUsers.findIndex(
      (user) => data === user.userId
    );
    if (currentUserIndex !== -1) {
      onlineUsers[currentUserIndex].socketIds.push(socket.id);
    } else {
      onlineUsers.push({ userId: data, socketIds: [socket.id] });
    }
  });


  socket.on('join_room', (data) => {
    console.log("Join room:", data);
    socket.join(data.discussionId);
    socket.discussionId = data.discussionId;
  })


});
*/
module.exports = {
  conversationSocketsMap,
  io
};
