const express = require('express')
const authRouter = require('./public/authRouter')
const usersRouter = require("./users/usersRouter");
const tasksRouter = require("./tasks/tasksRouter")
const temsRouter = require("./team/team.route");
const taskTypesRouter = require("./taskTypes/taskTypesRouter")
const adminRouter = require("./admin/adminRouter")
const messageRouter = require("./message/messageRoute")
const discussionRouter = require("./message/discussionRoute")
const commentRouter = require("./comment/commentRoute")
const imageRouter = require('./image/imageRoute')
const notifRouter = require('./notificationGenerale/notifRouter')
const SubSubTaskTypeRouter = require('./SubSubTaskTypes/SSTT.router')
const SubTaskTypeRouter = require('./SubTaskType/SubTaskType.router')
const projectRouter = require('./project/projectRoute')
const agentRouter = require('./Agent/agentRouter')
const transactionRouter = require('./transaction/transactionRoutes')
const paymentRouter = require('./payment/paymentRouter')
const captchaRouter = require('./captcha/captchaRouter')

let router = express.Router()

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/team', temsRouter);
router.use('/tasks', tasksRouter)
router.use('/image', imageRouter)
router.use('/tasktypes', taskTypesRouter)
router.use('/admin', adminRouter)
router.use('/message', messageRouter)
router.use('/discussion', discussionRouter)
router.use('/comment', commentRouter)
router.use('/notif', notifRouter)
router.use('/SSTT', SubSubTaskTypeRouter)
router.use('/STT', SubTaskTypeRouter)
router.use('/project', projectRouter)
router.use('/agent', agentRouter)
router.use('/transaction', transactionRouter)
router.use('/payment', paymentRouter)
router.use('/captcha', captchaRouter)

module.exports = router