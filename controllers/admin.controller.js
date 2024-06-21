const { Admin, SuperAdmin } = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utils = require("../utils/jwt.utils") ;
const jwt_secret = "fkjhkljlmd";

const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    

    let User;
    console.log(role);
    if (role === "admin") {
      User = Admin;
    } else if (role === "superAdmin") {
      User = SuperAdmin;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const similarUser = await User.findOne({ email });
    if (similarUser) {
      return res
        .status(401)
        .json({ message: "User with same Email already exists!" });
    }
    const hash = await bcrypt.hash(password, 10);

    //create user based on the role
    const user = await User.create({ username, email, password: hash, role });

    const token = jwt.sign({ id: user._id, role: user.role }, jwt_secret, {
      expiresIn: "1d",
    });
    // Return the token in the response
    res.status(200).json({ token, message: role + " created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
const getAdminByToken =async (req, res) => {
    try {
      const user= req.user.admin;
      if(!user)
      return  res.status(404).json('User not found !');

      const admin = await Admin.findById(user._id)

      if(!admin){
        const superAdmin = await SuperAdmin.findById(user._id)
        
        if(!superAdmin) 
        return  res.status(404).json('User not found !');
        
        return res.status(200).json({ superAdmin});
      }
      
      return res.status(200).json({ admin});

    }catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }}
//get all admin and superAdmin users
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    const superAdmins = await SuperAdmin.find();
    res.status(200).json({ admins, superAdmins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
//get admin or superadmin by id
const getAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    const superAdmin = await SuperAdmin.findById(id);
    if (!admin && !superAdmin) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ admin, superAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

//delete admin user and superAdmin user by id
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    const superAdmin = await SuperAdmin.findByIdAndDelete(id);
    if (!admin && !superAdmin) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

//update admin user and superAdmin user by id
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      id,
      { username, email, password, role },
      { new: true }
    );
    const superAdmin = await SuperAdmin.findByIdAndUpdate(
      id,
      { username, email, password, role },
      { new: true }
    );
    if (!admin && !superAdmin) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

module.exports = { createAdmin, getAllAdmins, deleteAdmin, getAdmin , updateAdmin,getAdminByToken};
