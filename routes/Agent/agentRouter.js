
const express = require('express')
const agentController = require('../../controllers/agent.controller')
// const passport = require('passport');

const agentRouter = express.Router()

agentRouter.post('/register', agentController.signUp);





module.exports = agentRouter