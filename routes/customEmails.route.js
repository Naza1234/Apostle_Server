const express = require('express');
const router = express.Router();
const Emails = require('../controllers/customEmails.controller');



router.post('/Contact-us', Emails.ContactUsEmailer);


router.post('/Custom-email', Emails.CustomEmailer);


router.post('/forgot-password', Emails.ForGotPasswordEmailer);




module.exports = router;