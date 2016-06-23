var Annotator = require('../models/annotators')

function guid(len) {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  function s1() {
    return Math.floor((1 + Math.random()) * 0x10).toString(16).substring(1);
  }
  uid = ""
  while(uid.length <= len-4) {
    uid += s4()
  }
  while(uid.length < len) {
    uid += s1()
  }
  return uid
}

exports.generateSecret = function(length) {
    return guid(length)
}
