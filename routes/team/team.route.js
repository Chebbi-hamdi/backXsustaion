const teamController = require('../../controllers/team.controller');
const referController = require('../../controllers/ReferFriend.controller');

const authJwt = require('../../middlewares/auth.middleware');
const express = require('express')
const teamRouter = express.Router()
//teamRouter.post('/', teamController.createTeam);
teamRouter.get('/:TeamId', teamController.getTeamById);
teamRouter.get('/', teamController.getAllTeams);
teamRouter.get('/lead/:leaderId', teamController.getTeamByIdLeader);
teamRouter.delete('/:teamId', teamController.deleteTeam);
teamRouter.delete('/DelTeammate/:TeammateId/:TeamId', teamController.deleteTeammate);
teamRouter.post('/contact', referController.ContactUS);


//teamRouter.delete('/', teamController.facebookLogin); 
//teamRouter.put('/', teamController.facebookCallback, authController.handleFacebookSuccess); 
teamRouter.put('/add-team-member', authJwt , teamController.addTeamMembers); 
teamRouter.put('/sendMemberIvit', authJwt , teamController.sendMemberIvit); 
teamRouter.put('/referFriend', authJwt , referController.ReferAfriend); 
teamRouter.get('/getTokenValue/:tokenteam', teamController.getTokenValues);
teamRouter.get('/getTokenValuesRef/:tokenRef', teamController.getTokenValuesRef);
teamRouter.put('/getFriendsRefered',authJwt, referController.GetReferedFriends);
teamRouter.put('/GetLinkRef',authJwt, referController.GenLinkRef);


module.exports = teamRouter;
