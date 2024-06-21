const cron = require('node-cron');
const {sendEndNotif} = require("../socket/tasksSocket")

const endTaskCron=  (cronEndTime,task) => {
    try {
        const scheduledTask = cron.schedule(cronEndTime, async () => {
            try {
                sendEndNotif(task);
            } catch (error) {
                console.error(error);
            }
        }, {
            scheduled: false
        });

        scheduledTask.start();

    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    endTaskCron,
}