const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  FilePath: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
