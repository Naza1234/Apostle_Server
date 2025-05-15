const mongoose = require('mongoose');

const UserProfileImageSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  FilePath: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfileImage', UserProfileImageSchema);
