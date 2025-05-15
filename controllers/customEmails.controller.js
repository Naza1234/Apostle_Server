const Rental = require('../models/Rental.model');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const Reserve = require('../models/Reserve.model');
const PowerBank = require('../models/PowerBank.model');
const UserProfileImage = require('../models/UserProfileImage.model');
const UserSchoolProfile = require('../models/UserSchoolProfile.model');
const LateReturnPrice = require('../models/LateReturnPrice.model');
const ReserveTime = require('../models/ReserveTime.model');
const axios = require('axios');
const { ContactUsEmail, SendCustomMessages, ForGotPassword } = require('../assets/mailingFunctions');



exports.ContactUsEmailer = async (req, res) => {
  const { UserName, Email, PhNo, SubJect, Message } = req.body;

  if (!UserName || !Email || !PhNo || !SubJect || !Message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const data = {
      UserName,
      Email,
      PhNo,
      SubJect,
      Message
    };

    await ContactUsEmail(data);

    return res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error in ContactUsEmailer:", error);
    return res.status(500).json({ error: "An error occurred while sending the message." });
  }
};

  


exports.CustomEmailer = async (req, res) => {
  const { UserId, SubJect, Message } = req.body;

  if (!UserId || !SubJect || !Message) {
    return res.status(400).json({ error: "UserId, SubJect, and Message are required." });
  }

  try {
    const user = await User.findById(UserId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await SendCustomMessages(user.UserEmail, user.UserName, SubJect, Message);

    return res.status(200).json({ message: "Email sent successfully to the user." });
  } catch (error) {
    console.error("Error in CustomEmailer:", error);
    return res.status(500).json({ error: "An error occurred while sending the email." });
  }
};




exports.ForGotPasswordEmailer = async (req, res) => {
  const { UserEmail , RedirectionUrl} = req.body;

  if (!UserEmail) {
    return res.status(400).json({
      status: "error",
      message: "Email required.",
    });
  }

  try {
    const user = await User.findOne({UserEmail:UserEmail});

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    await ForGotPassword(user.UserEmail, user.UserName,`${RedirectionUrl}?state=ChangePassword`);

    return res.status(200).json({
      status: "success",
      message: "Email sent successfully to the user.",
    });
  } catch (error) {
    console.error("Error in CustomEmailer:", error);
    return res.status(500).json({ error: "An error occurred while sending the email." });
  }
};
