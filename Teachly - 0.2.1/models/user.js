const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authId: {
    type: String, //f-id, g-id, c-id
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: {
    data: Buffer,
    contentType: String 
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isTeaching: {
    type: Boolean,
    default: false
  },
  isModerator: {
    type: Boolean,
    default: false    
  },
  isAdmin: { //if mod or addmin, hide
    type: Boolean,
    default: false    
  },  
  languages: {
    type: Array,
  },
  teaching: {
    type: Array,
  },
  price: {
    type: Number // measuerd in money / time(1 hour) and $
  },
  rating: {
    type: Number,
  },
  notifications: {
    type: Array,
    default: []
  },
  log: { 
    type: Array,
    default: []
  },
  schedualedLessons: {
    type: Array,
    default: []
  }
})


module.exports = mongoose.model('User', userSchema)
