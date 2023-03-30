//this will only be able to be read and appended to

const mongoose = require('mongoose')

const StorySchema = new mongoose.Schema({
    messages: {
        type: Array,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Story', StorySchema)


