const Rental = require('../models/Rental.model');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const Reserve = require('../models/Reserve.model');
const VideoModel = require('../models/Videos.model');
const PowerBank = require('../models/PowerBank.model');
const UserProfileImage = require('../models/UserProfileImage.model');
const UserSchoolProfile = require('../models/UserSchoolProfile.model');
const LateReturnPrice = require('../models/LateReturnPrice.model');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const { LogInEmail, SingUpEmail, VerificationEmail } = require('../assets/mailingFunctions');
// const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs'); // Use legacy build for Node pdfjs-dist/legacy/build/pdf.js



// Utility: Calculate due date based on rental time
function calculateDueDate(dateRented) {
    const dueDate = new Date(dateRented);
    const hour = dueDate.getHours();
  
    if (hour < 14) {
      // Before 2PM: due same day before 10PM
      dueDate.setHours(22, 0, 0, 0); // 10PM
    } else {
      // After 2PM: due next day before 10AM
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(10, 0, 0, 0); // 10AM
    }
  
    return dueDate;
  }

  // function parseStudentInfo(text) {


  //   const data = {};
  
  //   const getLine = (label, multiline = false) => {
  //     const pattern = multiline 
  //       ? new RegExp(`${label}:([\\s\\S]*?)(?=\\n\\w|\\n[A-Z]|$)`, 'i')
  //       : new RegExp(`${label}:\\s*(.*)`, 'i');
  //     const match = text.match(pattern);
  //     return match ? match[1].trim().replace(/\n+/g, ' ') : '';
  //   };
  
  //   // Clean up weird merged values
  //   const fixMergedEmails = (input) => {
  //     const emails = input.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi);
  //     return emails ? [...new Set(emails)] : [];
  //   };
  
  //   const getRelationship = (text) => {
  //     const match = text.match(/Relationship:([A-Z]+)/i);
  //     return match ? match[1].trim() : '';
  //   };
  
  //   data.surname = getLine("Surname");
  //   data.firstName = getLine("First Name");
  //   data.middleName = getLine("Middle Name");
  //   data.sex = getLine("Sex");
  //   data.dateOfBirth = getLine("Date of Birth");
  //   data.stateOfOrigin = getLine("State Of Origin");
  //   data.lgaOfOrigin = getLine("LGA Of Origin");
  //   data.homeTown = getLine("Home Town");
  //   data.permanentAddress = getLine("Permanent Address", true);
  //   data.mobilePhone = getLine("Mobile Phone");
  //   data.contactAddress = getLine("Contact Address", true);
  //   data.bloodGroup = getLine("Blood Group");
  //   data.genotype = getLine("Genotype");
  //   data.religion = getLine("Religion");
    
  //   const allEmails = fixMergedEmails(text);
  //   data.email = allEmails[0] || '';
  
  //   const sponsorName = getLine("Sponsor's Fullname");
  //   const nextOfKinName = getLine("Next of Kin\\s*Fullname");
  
  //   data.sponsor = {
  //     fullName: sponsorName,
  //     address: getLine("Sponsor's Address", true),
  //     mobile: getLine("Sponsor's Mobile No"),
  //     email: allEmails[0] || '',
  //     relationship: getRelationship(text),
  //   };
  
  //   data.nextOfKin = {
  //     fullName: nextOfKinName,
  //     address: getLine("Next of Kin Address", true),
  //     mobile: getLine("Next of Kin MobileNo"),
  //     email: allEmails[1] || '',
  //     relationship: getRelationship(text),
  //   };
  
  //   data.programme = {
  //     department: getLine("Department", true),
  //     modeOfEntry: getLine("Mode of Entry"),
  //     studentType: getLine("Student Type"),
  //     modeOfStudy: getLine("Mode of Study"),
  //     programme: getLine("Programme"),
  //     entryYear: getLine("Entry Year"),
  //     regNo: getLine("Reg No"),
  //     yearOfGraduation: getLine("Year of Graduation"),
  //     jambNo: getLine("JAMB No"),
  //     yearOfStudy: getLine("Year of Study"),
  //     studentMode: getLine("Student Mode")
  //   };
  
  //   return data;
  // }
  
  

  
// Helper to encode file to base64 and remove it


function parseStudentInfo(text) {
  const fields = [
    "Surname",
    "First Name",
    "Middle Name",
    "Sex",
    "Date of Birth",
    "State Of Origin",
    "LGA Of Origin",
    "Home Town",
    "Permanent Address",
    "Mobile Phone",
    "Contact Address",
    "Blood Group",
    "Genotype",
    "Religion",
    "Email",
    "Sponsor's Fullname",
    "Next of Kin Fullname",
    "Sponsor's Address",
    "Next of Kin Address",
    "Sponsor's Mobile No",
    "Next of Kin MobileNo",
    "Relationship",
    "Sponsor Email",
    "Next of Kin Email",
    "Department",
    "Mode of Entry",
    "Student Type",
    "Mode of Study",
    "Programme",
    "Entry Year",
    "Reg No",
    "Year of Graduation",
    "JAMB No",
    "Year of Study",
    "Student Mode"
  ];

  // List of headings/titles to ignore completely if found
  const ignoredTitles = [
    "Sponsor and Next of kin details",
    // add more headings to ignore here if needed
  ];

  const result = {};

  // Escape all field names for regex safety
  const escapedFields = fields.map(f => f.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  const joinedFields = escapedFields.join("|");

  // Remove ignored titles from the text before parsing
  for (const title of ignoredTitles) {
    const escapedTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const titleRegex = new RegExp(`\\b${escapedTitle}\\b`, "gi");
    text = text.replace(titleRegex, "");
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const escapedField = escapedFields[i];

    // Match field name (with optional colon), then grab everything until next field or end
    const pattern = new RegExp(
      `${escapedField}\\s*:?[ \\t]*([\\s\\S]*?)(?=\\b(?:${joinedFields})\\b|$)`,
      "i"
    );

    const match = text.match(pattern);
    if (match) {
      const value = match[1].trim().replace(/\s+/g, " ");
      result[field] = value;
    } else {
      result[field] = ""; // fallback if not found
    }
  }

  return result;
}




const encodeAndRemoveFile = (filePath, mimeType) => {
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  // Remove the file after encoding
  fs.unlinkSync(filePath);

  return dataUri;
};




async function extractPdfContent(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  // const tempPath = path.join(outputFolder, 'temp.pdf');
  // fs.writeFileSync(tempPath, buffer);

  // Extract text using pdf-parse
  const data = await pdfParse(buffer);

  // Extract images using pdf-image
  // const pdfImage = new PDFImage(tempPath, {
  //   outputDirectory: outputFolder,
  //   convertOptions: {
  //     '-quality': '100',
  //     '-density': '300',
  //   }
  // });

  // const imagePaths = await pdfImage.convertFile(); // returns array of image paths
  // console.log('Images saved at:', imagePaths);

  return data
}

// Load PDF and extract text
// async function extractTextFromPDF(base64Pdf) {
//   const pdfjsLib = await import('pdfjs-dist/legacy/build/');
//   const uint8Array = base64ToUint8Array(base64Pdf);
//   const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
//   const pdf = await loadingTask.promise;

//   let fullText = '';
//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();
//     const strings = content.items.map(item => item.str).join(' ');
//     fullText += `Page ${i}:\n${strings}\n\n`;
//   }

//   return fullText;
// }


exports.getSummaryStats = async (req, res) => {
    try {
      // Get all power banks and sum up NumberInStor and NumberOnLine
      const powerBanks = await PowerBank.find({});
      let totalPowerBanks = 0;
      for (const pb of powerBanks) {
        totalPowerBanks += (pb.NumberInStor || 0) + (pb.NumberOnLine || 0);
      }
  
      const now = new Date();
      const allOngoingRentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });
  
      let totalOverdueRentals = 0;
      let totalActiveRentals = 0;
  
      for (const rental of allOngoingRentals) {
        const dueDate = calculateDueDate(rental.DateRented);
        if (!rental.DateReturned && now > dueDate) {
          totalOverdueRentals++;
        } else {
          totalActiveRentals++;
        }
      }
  
      const totalReservedRentals = await Reserve.countDocuments({ Rent: 'Reserved' });
  
      return res.status(200).json({
        totalPowerBanks,
        totalActiveRentals,
        totalOverdueRentals,
        totalReservedRentals
      });
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  

  
exports.getRentalFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // ---------- PART 1: Overdue Rentals ----------
    const ongoingRentals = await Rental.find({ RentalStatus: { $ne: 'Completed' } });

    let totalLateFees = 0;

    for (const rental of ongoingRentals) {
      const dueDate = calculateDueDate(rental.DateRented);

      
      if (now > dueDate && dueDate >= start && dueDate <= end) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;

        totalLateFees += lateFee;
      }
    }

    // ---------- PART 2: Completed Rentals ----------
    const completedRentals = await Rental.find({
      RentalStatus: 'Completed',
      DateReturned: { $gte: start, $lte: end }
    });

    let totalCompletedAmount = 0;
    for (const rental of completedRentals) {
      totalCompletedAmount += rental.AmountPaid || 0;
    }

    // ---------- PART 3: User Balances (Money Owed) ----------
    const users = await User.find({});
    let totalMoneyOwedByUsers = 0;

    for (const user of users) {
      const balance = parseFloat(user.UserAccountBalance);
      if (!isNaN(balance)) {
        totalMoneyOwedByUsers += balance;
      }
    }

    // ---------- FINAL RESPONSE ----------
    return res.status(200).json({
      totalOverdueLateFees: totalLateFees,
      totalCompletedRentalAmount: totalCompletedAmount,
      totalMoneyOwedByUsers: totalMoneyOwedByUsers
    });

  } catch (error) {
    console.error('Error calculating rental summary:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




exports.getUserInfoWithPin = async (req, res) => {
  const { UserPin, orders } = req.body; // powerBanks is the array of items with serialNo and selectedType
  const now = new Date();

  try {
    // Step 1: Find the user using the provided pin
    const users = await User.find();
    const matchedUsers = await Promise.all(users.map(async user => {
      const match = await bcrypt.compare(UserPin, user.UserPin);
      return match ? user : null;
    }));

    const user = matchedUsers.find(u => u);
    if (!user) return res.status(404).json({ message: 'Invalid pin' });

    // Step 2: Fetch profile image
    const profileImg = await UserProfileImage.findOne({ UserId: user._id });

    // Step 3: Get active rentals
    const ongoingRentals = await Rental.find({ UserId: user._id, RentalStatus: { $ne: 'Completed' } });

    // Step 4: Separate them into active (not overdue) and overdue rentals
    const activeRentals = [];
    const overdueRentals = [];
    
    for (const rental of ongoingRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (!rental.DateReturned && now > dueDate) {
        overdueRentals.push(rental);
      } else {
        activeRentals.push(rental);
      }
    }

    // Step 5: Calculate total overdue fees
    let totalOverdueFee = 0;
    for (const rental of overdueRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (now > dueDate) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;
        totalOverdueFee += lateFee;
      }
    }

    // Step 6: Match power bank types and get prices
    let totalPowerBankFee = 0;
    const powerBanksWithPrices = await Promise.all(
      orders.map(async (item) => {
        const matched = await PowerBank.findOne({ Name: item.selectedType });
        const price = matched ? matched.Price : 0;
        totalPowerBankFee += price;
    
        item.price = price; // mutate the existing item
        return item; // return the mutated item
      })
    );

    // Step 7: Calculate total fee (overdue fees + power bank total)
    const totalFee = totalOverdueFee + totalPowerBankFee;

    // Step 8: Send final response
    return res.status(200).json({
      userInfo: {
        id:user._id,
        name: user.UserName,
        accountApproved: user.AccountSetup,
        accountBalance: user.UserAccountBalance
      },
      profileImg,
      activeRentals,
      overdueRentals,
      overdueFee: totalOverdueFee,
      powerBanks: powerBanksWithPrices, // now includes price in each item
      totalPowerBankFee,
      totalFee
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


exports.getUserInfoWithPinFromReserve = async (req, res) => {
  const { UserPin} = req.body; // powerBanks is the array of items with serialNo and selectedType
  const now = new Date();

  try {
    // Step 1: Find the user using the provided pin
    console.log("test");
    const users = await User.find();
    const matchedUsers = await Promise.all(users.map(async user => {
      const match = await bcrypt.compare(UserPin, user.UserPin);
      return match ? user : null;
    }));

    const user = matchedUsers.find(u => u);
    if (!user) return res.status(404).json({ message: 'Invalid pin' });

    // Step 2: Fetch profile image
    const profileImg = await UserProfileImage.findOne({ UserId: user._id });

    // Step 3: Get active rentals
    const ongoingRentals = await Rental.find({ UserId: user._id, RentalStatus: { $ne: 'Completed' } });

    // Step 4: Separate them into active (not overdue) and overdue rentals
    const activeRentals = [];
    const overdueRentals = [];
    
    for (const rental of ongoingRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (!rental.DateReturned && now > dueDate) {
        overdueRentals.push(rental);
      } else {
        activeRentals.push(rental);
      }
    }

    // Step 5: Calculate total overdue fees
    let totalOverdueFee = 0;
    for (const rental of overdueRentals) {
      const dueDate = calculateDueDate(rental.DateRented);
      if (now > dueDate) {
        const overdueMs = now - dueDate;
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

        const priceEntry = await LateReturnPrice.findOne({ Name: rental.Type });
        const lateFee = priceEntry ? overdueHours * priceEntry.Price : 0;
        totalOverdueFee += lateFee;
      }
    }

    const orders = []

    const rentalsResults = await Reserve.find({ UserId : user._id , Rent : "Reserved"})
    
    for (const items in rentalsResults) {
      const item =rentalsResults[items]
        const data ={
          selectedType : item.Type,
          serialNo : "",
          price : item.Amount,
          duration:item.Duration,
          reserveId:item._id
        }
        
        orders.push(data)
    }


    // Step 6: Match power bank types and get prices
    let totalPowerBankFee = 0;
    // const powerBanksWithPrices = await Promise.all(
    //   orders.map(async (item) => {
    //     const matched = await PowerBank.findOne({ Name: item.selectedType });
    //     const price = matched ? matched.Price : 0;
    //     totalPowerBankFee += price;
    
    //     // item.price = price; // mutate the existing item
    //     return item; // return the mutated item
    //   })
    // );

    // Step 7: Calculate total fee (overdue fees + power bank total)
    const totalFee = totalOverdueFee + totalPowerBankFee;

    // Step 8: Send final response
    return res.status(200).json({
      userInfo: {
        id:user._id,
        name: user.UserName,
        accountApproved: user.AccountSetup,
        accountBalance: user.UserAccountBalance
      },
      profileImg,
      activeRentals,
      overdueRentals,
      overdueFee: totalOverdueFee,
      powerBanks: orders, // now includes price in each item
      totalPowerBankFee,
      totalFee
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};




exports.uploadVideo = async (req, res) => {
  try {
    // Check if user exists and hasn't completed setup
   
   
       const Video = new VideoModel({
        FilePath: req.file.path,
      }); 
      console.log(req.file.path)
      await Video.save();
  

    res.status(200).json(Video);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.GetVideo = async (req, res) => {
  try {
    // Check if user exists and hasn't completed setup
    const Video = await VideoModel.find({});
    // Encode file into base64 with data URI
   
    res.status(200).json(Video);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};




exports.CheckUserProfileInfo = async (req, res) => {
  const { RedirectionUrl } = req.body;

  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");

    // Extract data from uploaded PDF
    const fileData = fs.readFileSync(req.file.path);
    const data = await extractPdfContent(fileData);  

    const dataParser = parseStudentInfo(data.text);

    // Count existing users to generate fallback credentials
    const userCount = await User.countDocuments();
    const fallbackEmail = `userap${userCount + 1}@autogen.com`;
    const fallbackPassword = `userap${userCount + 1}`;

    const UserEmail = dataParser.Email?.trim() ? dataParser.Email : fallbackEmail;
    const UserPassword = fallbackPassword;

    // Check if email is already taken (case-insensitive)
    const existingUser = await User.findOne({
      UserEmail: { $regex: new RegExp(`^${UserEmail}$`, 'i') }
    });

    if (existingUser) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Prepare new user data
    const userData = {
      UserEmail,
      UserPassword,
      EmailVerificationCode: verificationCode,
      // AccountSetup will be set later after profile creation
    };

    if (dataParser["First Name"] || dataParser["Surname"]) {
      userData.UserName = `${dataParser["Surname"] || ""} ${dataParser["First Name"] || ""}`.trim();
    } else {
      userData.UserName = `user ap ${userCount + 1}`;
    }

    if (dataParser["Mobile Phone"]) {
      userData.UserMobile = dataParser["Mobile Phone"];
    }

    if (dataParser["Department"]) {
      userData.Department = dataParser["Department"];
    }

    if (dataParser["Reg No"]) {
      userData.RegNo = dataParser["Reg No"];
    }

    if (dataParser["Entry Year"]) {
      userData.Admission = dataParser["Entry Year"];
    }

    if (dataParser["Year of Study"]) {
      userData.Level = dataParser["Year of Study"];
    }

    // Create user first
    const user = new User(userData);
    await user.save();

    // Encode the uploaded file to base64
    const base64 = encodeAndRemoveFile(req.file.path, req.file.mimetype);

    // Always create or overwrite the user's school profile
    const schoolProfile = new UserSchoolProfile({
      UserId: user._id, // correctly used the created user's ID
      FilePath: base64,
    });

    await schoolProfile.save();

    // Now update AccountSetup to true after profile is saved
    user.AccountSetup = true;
    await user.save();

    // Send verification email after everything is done
    await VerificationEmail(
      UserEmail,
      "New User",
      `${RedirectionUrl}?verificationcode=${verificationCode}`
    );

    // Final response
    res.status(200).json({
      status: "success",
      message: "User created successfully",
      email: UserEmail,
      password: UserPassword,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
  
};



