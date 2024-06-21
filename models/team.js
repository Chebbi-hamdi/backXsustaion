const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle utilisateur
    autopopulate: true,

    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' ,// Référence au modèle utilisateur
    autopopulate: true,

  }],
  Name:{
    type:String,
    }
});


teamSchema.plugin(require('mongoose-autopopulate'));

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
