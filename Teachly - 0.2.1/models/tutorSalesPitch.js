const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  TutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviews: {
    type: Array,
    default: [],
  },
  price: {
    type: Number // measuerd in money / time(1 hour) and $
  },
})

module.exports = mongoose.model('Story', StorySchema)
