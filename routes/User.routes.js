const express = require('express');
const router = express.Router();
const {upload} = require('../middleware/upload');
const UserController = require('../controllers/User.controller');

// Register user
router.post('/register', UserController.registerUser);

// Login user
router.post('/login', UserController.loginUser);

// Get full user info by pin
router.post('/get-user-by-pin', UserController.getUserFullDataByPin);


router.get('/get-all-users/:page?', UserController.getAllUsers);


router.get('/user-name/', UserController.getAllUserNamesForForm);

// Delete user by ID
router.delete('/:id', UserController.deleteUser);

// Update user info if AccountSetup is false
router.put('/update-info/:id', UserController.updateUserInfoIfNotSetup);


router.put('/update-info-admin/:id', UserController.updateUserInfo);


// Update pin
router.put('/update-pin/:id', UserController.updateUserPin);

// Update password
router.put('/update-password/:id', UserController.updateUserPassword);


// Update password
router.put('/update-password-with-user-email', UserController.updateUserPasswordByEmail);

// Get all user data by ID
router.get('/full-info/:id', UserController.getAllUserDataById);

// Upload profile image
router.post('/upload-profile-image/:id', upload.single('file'), UserController.uploadProfileImage);

// Upload school profile
router.post('/upload-school-profile/:id', upload.single('file'), UserController.uploadSchoolProfile);

// Route to edit user details if the user is an owner
router.put('/:id/edit', UserController.editUserIfOwner);


module.exports = router;
