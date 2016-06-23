var mongoose = require('mongoose')

var ProjectSchema = mongoose.Schema({
  title:String,
  description:String,
  location:String,
  mu: {
      type: Number,
      default: 0
  },
  sigma_sq: {
      type: Number,
      default: 1
  }
})

module.exports = mongoose.model('project', ProjectSchema)
