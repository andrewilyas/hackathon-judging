var mongoose = require('mongoose')

var DecisionSchema = mongoose.Schema({
  annotator_id: String,
  winner_id: String,
  loser_id: String,
  timestamp: Date
})

module.exports = mongoose.model('decision', DecisionSchema)
