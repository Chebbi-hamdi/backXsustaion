const {io} = require("./socket")



const sendEndNotif = async (task) => {
    io.emit("TaskCompleted",task);
} 



module.exports = {
    sendEndNotif,
}