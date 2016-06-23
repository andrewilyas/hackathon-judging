var mongoose = require('mongoose')

var AnnotatorSchema = mongoose.Schema({
  name: String,
  email: String,
  description: {type: String, default: ""},
  secret: String,
  next_id: {
      type: String,
      default: ''
  },
  prev_id: {
      type: String,
      default: ''
  },
  alpha: {
      type: Number,
      default: 10
  },
  beta: {
      type: Number,
      default: 1
  },
  ignore: {
      type: Array,
      default: []
  }
})

AnnotatorSchema.statics.findById = function(id, callback) {
  return this.model('annotators').findOne({
    'userID': id
  }, callback)
}

module.exports = mongoose.model('annotators', AnnotatorSchema);
