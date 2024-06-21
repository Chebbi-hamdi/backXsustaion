const {io,conversationSocketsMap} = require("./socketConfig")

/*

const sendMessage = async (message, conversationId, sender) => {
    const sockets = conversationSocketsMap[conversationId] || [];

    sockets.forEach(socketId => {
        const data = {
            text: message,
            sender: sender,
            id_Discuion:conversationId,
        };
        io.to(socketId).emit('sendMessage', data);
    });
};
*/
module.exports = {
    /*sendMessage,*/
};
