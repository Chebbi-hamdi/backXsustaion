const onlineUsers = [];


function joinRoom(socket, io) {
    socket.on("newUser", (data) => {
        
        if (data) {
            let userId = data;
            
            let userExist = onlineUsers.find((x) => x.userId == userId);
            
            if (!userExist) {
                let arrayTab = [];
                arrayTab.push(socket.id);
                onlineUsers.push({ userId, userSocket: arrayTab });
            } else {
                userExist.userSocket.push(socket.id);
            }
        }
        io.emit("onlineUsers", onlineUsers);
        console.log('onlineUsers',onlineUsers)
    });
    

}
function leftRoom(socket, io) {
    socket.on("disconnect", () => {
        
        onlineUsers.forEach((user, index) => {
            if (user.userSocket.includes(socket.id)) {
                user.userSocket = user.userSocket.filter(id => id !== socket.id);
                if (user.userSocket.length === 0) {
                    onlineUsers.splice(index, 1);
                }
            }
        });

        // Emit updated online users list
        io.emit("onlineUsers", onlineUsers);
    });
}


function JoinDsc(socket, io) {
    socket.on('joinDiscution', (conversationId, userId) => {
        socket.join(conversationId);
        console.log('Joined Dsc',conversationId )
    });
}


const sendMessage = async (socket,io ) => {
    
    socket.on("sendMessage", ({message, idDsc, sender,receiver }) => {
        const data = {
        message ,
        idDsc ,
        sender,
        receiver 
    };

    const recipientSocket = onlineUsers.find(user => user.userId === receiver)?.userSocket;
    if (recipientSocket) {
        socket.to(recipientSocket).emit('messageNotification', data);
                
    } else {
    }
    io.to(idDsc).emit('sendMessage', data);
    console.log("idDsc:", idDsc);
    console.log("data:", data);
    });
    
};
const sendNotif = async (socket,io ) => {

    socket.on("messageNotification", ({content,  sender,receiver }) => {
    
    const recipientSocket = onlineUsers.find(user => user.userId === receiver._id)?.userSocket;

    if (recipientSocket) {
        socket.to(recipientSocket).emit('sendNotification', {content,  sender:sender._id,receiver:receiver._id });
        
    } else {
    }
    });
    
};
module.exports = {
    onlineUsers,
    joinRoom,
    JoinDsc,
    sendMessage,
    leftRoom,
    sendNotif
};