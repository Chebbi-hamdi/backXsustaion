const Team = require('../models/team');
const { generateTeamJWT } = require('../utils/jwt.utils');
const jwt = require('jsonwebtoken')
const {sendEmail}= require( '../utils/mailer/mailer.utils');
const User = require("../models/user");

// Créer une nouvelle équipe
/*async function createTeam(leaderId, memberIds) {
  try {
    const team = new Team({ leader: leaderId, members: memberIds });
    const savedTeam = await team.save();
    return savedTeam;
  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe :', error);
    throw error;
  }
}*/

// Obtenir une équipe par son ID
async function getTeamById(req, res, next) {
  const { TeamId } = req.params;
  try {
      const team = await Team.findById(TeamId);
      if (!team) {
          return res.status(404).send({ message: "Team not found" });
      }
      return res.send({ team });
  } catch (e) {
      console.log(e);
      next(e);
  }
}
async function getTeamByIdLeader(req, res, next) {
  try {
    const leaderId = req.params.leaderId;
    const team = await Team.find({ leader: leaderId }).populate('members leader');
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this leader ID' });
    }
    res.json({ team });
  } catch (error) {
    console.error('Error fetching team by leader ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

  
  // Obtenir toutes les ézquipes
// Function to retrieve all teams from the database
async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find();
    return res.json({ teams }); // Send the teams as JSON response
  } catch (error) {
    console.error('Error fetching teams:', error);
    return next(error); // Pass the error to Express error handling middleware
  }
}

// Mettre à jour une équipe
/*async function updateTeam(req, res, next) {
    try {
      const teamId = req.params.teamId;

      const team = await Team.findByIdAndUpdate(teamId, updatedData, { new: true });
      return res.json({ team }); // Send the teams as JSON response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipe :', error);
      return next(error); // Pass the error to Express error handling middleware
    }
  }*/
  // Supprimer une équipe par son ID
async function deleteTeam(req, res, next) {
    try {
      const teamId =req.params.teamId
      const deletedTeam = await Team.findByIdAndDelete(teamId);
      return res.json( "supp okkk" );
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe :', error);
      throw error;
    }
  }
  async function sendMemberIvit(req, res, next) {
    try {
      const user = req.user._id;
      const { email } = req.body;
      // Check if the email already exists in the database
      const userex = await User.findOne({ "email.primary": email.toLowerCase() });
      if (userex) {
        return res.status(404).json({ message: "User already sybscribed" });
      }
    
      const getTeam = await Team.findOne({ leader: user });
  
      if (!getTeam)
        return res.status(404).json({ err: "Équipe non trouvée !" });
      
      const tokenTeam = generateTeamJWT(getTeam._id);
      const tokenValues = await getTokenValues1(tokenTeam);
      const link = `http://192.168.11.113:3001/sign_up/?tokenteam=${tokenTeam}`;
  
      sendEmail(email, "Rejoindre l'équipe", `Cliquez sur ce lien pour rejoindre l'équipe : ${link}`);
  
      return res.status(200).json({ tokenTeam, tokenValues });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation de membre :', error);
      throw error;
    }
  }
        
  async function addTeamMembers(req, res, next) {
    try {
        const userId = req.user._id; // ID de l'utilisateur actuel
        const memberEmails = req.body.emails; // Tableau d'adresses e-mail des membres à ajouter

        // Recherche de l'équipe dirigée par l'utilisateur actuel
        const team = await Team.findOne({ leader: userId });
      
        if (!team) {
            return res.status(404).json({ error: "Team not found!" });
        }

        // Recherche des utilisateurs correspondant aux adresses e-mail fournies
        const users = await User.find({ "email.primary": { $in: memberEmails } });
        const memberIds = users.map(user => user._id);

        // Ajout des ID des nouveaux membres à la liste des membres de l'équipe
        team.members.push(...memberIds);

        // Enregistrement des modifications apportées à l'équipe
        await team.save();

        return res.status(200).json({ team, message: "Members added successfully!" });
    } catch (error) {
        console.error('Error adding team members:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
  async function getTokenValues1(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET); 
      return decoded;
    } catch (error) {
      console.error('Erreur lors de la vérification du token :', error);
      throw error;
    }
  }
  async function getTokenValues(ttokenteam) {
    try {
        const decoded = jwt.verify(ttokenteam, process.env.JWT_TOKEN_SECRET);

        const teamIdd = decoded.team; // Extraction de l'ID de l'équipe à partir du token décodé

        return teamIdd;
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        throw error;
    }
}
async function getTokenValuesRef(tokenRef) {
  try {
    const decoded = jwt.verify(tokenRef, process.env.JWT_TOKEN_SECRET);
    return({_id:decoded.refId} );
  } catch (error) {
    console.error('Erreur lors de la récupération de la valeur du token:', error);
  }
}
async function deleteTeammate(req, res, next) {
  try {
    const { TeammateId, TeamId } = req.params;

    // Find the team by ID
    const team = await Team.findById(TeamId);

    // Check if the team exists
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find the teammate in the members array
    const teammate = team.members.find(member => member.equals(TeammateId));

    // If teammate not found in the members array
    if (!teammate) {
      return res.status(404).json({ message: 'Teammate not found in the team' });
    }

    // Remove the teammate from the members array
    team.members.pull(teammate);

    // Save the updated team
    const updatedTeam = await team.save();

    return res.json({ message: 'Teammate removed successfully', team: updatedTeam });
  } catch (error) {
    console.error('Error while deleting teammate:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}



  
  module.exports = {
    //createTeam,
    getTeamById,
    getAllTeams,
    //updateTeam,
    deleteTeam,
    addTeamMembers,
    sendMemberIvit,
    getTokenValues,
    getTeamByIdLeader,
    deleteTeammate,
    getTokenValuesRef,
    
  };
  