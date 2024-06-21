// const {Admin , SuperAdmin} = require('../models/admin');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const createError = require('http-errors');
// const {isSuperAdmin} = require('../middlewares/adminMiddlwares');

// const jwt_secret='LsqSp6YQZD0i7qnDyagjPWjlNTYuDofvU9zKse3n2XGzo1ty6iR3zWOy4SKbn/G2To2u8lWpVyoDcQDEGFhxtw=='

// const signUpAdmin = async (req, res) => {
//     try {
//         const { username, email, password, role } = req.body;

//         const similarAdmin = await Admin.findOne({ email });
//         if (similarAdmin) {
//             throw createError(401, `User with same Email already exists!`);
//         }
//         const hash = await bcrypt.hash(password, 10);
//         const user = await Admin.create({ username, email, password: hash, role });
//         const token = jwt.sign({ id: user._id, role: user.role }, jwt_secret, { expiresIn: "1d" });
//         res.status(200).json({ token }); // Return the token in the response

//     }catch (error) {
//         console.error(error);
//         res.status(500).json({ error });
//     }
// }

// const loginAdmin = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             throw createError(400, 'Email and password are required');
//         }
//         const admin = await Admin.findOne({ email });
//         if (!admin) {
//             throw createError(401, 'Invalid credentials');
//         }
//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             throw createError(401, 'Invalid credentials');
//         }
//         const token = jwt.verify({ id: admin._id, role: admin.role }, jwt_secret, { expiresIn: "1d" });
//         res.status(200).json({ token });
//     }

//     catch (error) {
//         console.error(error);
//         res.status(500).json({ error });
//     }

// }

// module.exports = { signUpAdmin, loginAdmin };


const {SuperAdmin, Admin} = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret = "fkjhkljlmd";

// Controller function for admin signup
const signUpAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if the email is already in use
    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (role !== "superAdmin" ) {
      return res.status(400).json({ message: "Invalid role" });
    }


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new SuperAdmin({
      username,
      email,
      password: hashedPassword,
      role
    });

    // Save the admin to the database
    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign({ newAdmin }, jwt_secret, { expiresIn: "7d" });

    // Return the token in the response
    res.status(201).json({ token , message: "SuperAdmin created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function for admin and superAdmin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the admin exists
    const admin = await SuperAdmin.findOne({
      email,
    }) || await Admin.findOne({ email });

    if (!admin) { 
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ admin }, jwt_secret, { expiresIn: "1d" });

    // Return the token in the response
    res.status(200).json({ token,admin , message: "Login successful"});
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = { signUpAdmin, loginAdmin };
