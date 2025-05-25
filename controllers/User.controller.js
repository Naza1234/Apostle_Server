// controllers/User.controller.js
const User = require('../models/User.model');
const UserProfileImage = require('../models/UserProfileImage.model');
const UserSchoolProfile = require('../models/UserSchoolProfile.model');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { LogInEmail, SingUpEmail, VerificationEmail } = require('../assets/mailingFunctions');



// Helper to encode file to base64 and remove it

const encodeAndRemoveFile = (filePath, mimeType) => {
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  // Remove the file after encoding
  fs.unlinkSync(filePath);

  return dataUri;
};


exports.registerUser = async (req, res) => {
  const { UserEmail, UserMobile, UserPassword ,RedirectionUrl } = req.body;

  try {
    const verificationCode = crypto.randomBytes(3).toString('hex'); // e.g. "3fa48e"

    if (
      !UserEmail || UserEmail.trim().length <= 1 ||
      !UserMobile || UserMobile.trim().length <= 1 ||
      !UserPassword || UserPassword.trim().length <= 1
    ) {
      return res.status(400).json({
        status: "error",
        message: "Fields are required to register you"
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ UserEmail });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    // Create new user
    const user = new User({ UserEmail, UserMobile, UserPassword , EmailVerificationCode:verificationCode});
    await user.save();
    await VerificationEmail(
      UserEmail,
      "New User",
      `${RedirectionUrl}?verificationcode=${verificationCode}`
    );
    return res.status(201).json({
      status: "okay",
      message: "User registered successfully, check email to proceed",
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};


exports.loginUser = async (req, res) => {
  const { UserEmail, UserPassword, VerificationCode,RedirectionUrl} = req.body;

  try {
    // Validate input
    if (
      !UserEmail || UserEmail.trim().length <= 1 ||
      !UserPassword || UserPassword.trim().length <= 1
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ UserEmail });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    // Handle email verification via code (optional step)
    if (VerificationCode) {
      if (user.EmailVerificationCode === VerificationCode) {
        user.EmailVerified = true;
        user.EmailVerificationCode = undefined;
        await user.save();
        await SingUpEmail(UserEmail,user.UserName || "New User")
      } else if(!user.EmailVerified){
        await VerificationEmail(
          UserEmail,
          "New User",
          `${RedirectionUrl}?verificationcode=${user.EmailVerificationCode}`
        );
        return res.status(400).json({
          status: "error",
          message: "Invalid verification code. Please check your email for a valid link.",
        });
      }
    }

    // Check if email is verified
    // if (!user.EmailVerified) {
      // await VerificationEmail(
       // UserEmail,
       // "New User",
       // `${RedirectionUrl}?
// verificationcode=$//{user.EmailVerificationCode}`
  //    );
   //   return res.status(403).json({
    //    status: "error",
     //   message: "Email not verified. Please //check your email for the verification link.",
     // });
    //}

    // Compare password
    const isMatch = await bcrypt.compare(UserPassword, user.UserPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password.",
      });
    }

  
     await LogInEmail(UserEmail,user.UserName || "New User")

    // Login successful
    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      response: {
        UserId: user._id,
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred during login: " + error.message,
    });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.params.page) === 0 ? 1 : 1 // default to page 1
    const limit = 100;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(); // total number of users

    const users = await User.find()
      .sort({ createdAt: -1 }) // optional: most recent users first
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      total,
      page,
      pages: totalPages,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

exports.getAllUserNamesForForm = async (req, res) => {
  try {
    const userNames = await User.find({}, 'UserName'); // Fetch only the UserName field

    
    res.status(200).json({
      status: 'success',
      data: userNames,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

// Get full user info with pin
exports.getUserFullDataByPin = async (req, res) => {
  const { UserPin } = req.body;
  try {
    const users = await User.find();
    const targetUser = await Promise.all(users.map(async user => {
      const match = await bcrypt.compare(UserPin, user.UserPin);
      return match ? user : null;
    }));
    const user = targetUser.find(u => u);
    if (!user) return res.status(404).json({ message: 'Invalid pin' });

    const profileImg = await UserProfileImage.findOne({ UserId: user._id });
    const schoolProfile = await UserSchoolProfile.findOne({ UserId: user._id });

    res.status(200).json({ user, profileImg, schoolProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user info by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    await UserProfileImage.deleteOne({ UserId: id });
    await UserSchoolProfile.deleteOne({ UserId: id });
    res.status(200).json({ message: 'User and related files deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user info if AccountSetup is false
exports.updateUserInfoIfNotSetup = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if user exists and AccountSetup is false
    const user = await User.findById(id);
    // if (!user || user.AccountSetup) {
     // return res.status(403).json({ message: //'Unauthorized update' });
   // }

    // Perform the update without calling save
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // return the updated document
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update user info
exports.updateUserInfo = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const user = await User.findById(id);
    Object.assign(user, updateData);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateUserPin = async (req, res) => {
  const { id } = req.params;
  const { UserPin } = req.body;

  try {
    const allUsers = await User.find();

    const isPinUsed = await Promise.any(
      allUsers.map(async (user) => {
        if (!user.UserPin) return false;
        const match = await bcrypt.compare(UserPin, user.UserPin);
        return match;
      })
    ).catch(() => false); // If no promise resolves, this means the pin is unused

    if (isPinUsed) {
      return res.status(400).json({ message: 'Pin already in use. Please enter a different pin.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(UserPin, salt);

    await User.findByIdAndUpdate(id, { UserPin: hashedPin });

    res.status(200).json({ message: 'Pin updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update password
exports.updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { UserPassword } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(UserPassword, salt);
    await User.findByIdAndUpdate(id, { UserPassword: hashedPassword });
    res.status(200).json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateUserPasswordByEmail = async (req, res) => {
  const { UserEmail, UserPassword } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ UserEmail });
    if (!user) {
      return res.status(404).json(  {status: "error",
      message: "User not found."});
    }


    // Update the password
    await User.findOneAndUpdate({ UserEmail }, { UserPassword:  UserPassword });

    return res.status(200).json({
      status: "success",
      message: "Password changed successively ",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get all user data by user ID
exports.getAllUserDataById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const profileImg = await UserProfileImage.findOne({ UserId: id });
    const schoolProfile = await UserSchoolProfile.findOne({ UserId: id });
    res.status(200).json({ user, profileImg, schoolProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload user profile image
exports.uploadProfileImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists and hasn't completed setup
    const user = await User.findById(id);
    if (!user || user.AccountSetup) {
      return res.status(403).json({ message: 'Unauthorized update' });
    }

    // Encode file into base64 with data URI
    const base64 = encodeAndRemoveFile(req.file.path, req.file.mimetype);
    // Check if image already exists
    let userProfileImage = await UserProfileImage.findOne({ UserId: id });
    console.log(base64);

    if (userProfileImage) {
      userProfileImage.FilePath = base64;
      await userProfileImage.save();
    } else {
      userProfileImage = new UserProfileImage({
        UserId: id,
        FilePath: base64,
      });

      await userProfileImage.save();
    }

    res.status(200).json(userProfileImage);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload user school profile
exports.uploadSchoolProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists and hasn't completed setup
    const user = await User.findById(id);
    if (!user || user.AccountSetup) {
      return res.status(403).json({ message: 'Unauthorized update' });
    }

    // Encode the uploaded file
    const base64 = encodeAndRemoveFile(req.file.path, req.file.mimetype);

    // Check if school profile already exists
    let schoolProfile = await UserSchoolProfile.findOne({ UserId: id });

    if (schoolProfile) {
      schoolProfile.FilePath = base64;
      await schoolProfile.save();
    } else {
      schoolProfile = new UserSchoolProfile({
        UserId: id,
        FilePath: base64,
      });

      await schoolProfile.save();
         // Update user's AccountSetup to true
     await User.findByIdAndUpdate(id, { AccountSetup: true });

    }

    res.status(200).json(schoolProfile);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Edit User if they are an owner
exports.editUserIfOwner = async (req, res) => {
  try {
    const { id } = req.params;  // Get the user ID from the URL parameter
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user's status is 'owner'
    if (user.status !== 'owner') {
      return res.status(403).json({ error: 'You do not have permission to edit this user' });
    }

    // Update the user with the data from the request body
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json(updatedUser);  // Send the updated user details back
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


