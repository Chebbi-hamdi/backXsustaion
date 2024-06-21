const mongoose = require("mongoose");
const schema = mongoose.Schema;

const adminSchema = new schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const roles = ["admin", "superAdmin"];

const adminSchemaRole = adminSchema.clone();
adminSchemaRole.add({
  role: {
    type: String,
    enum: roles,
    required: true,
  },
});

const Admin = mongoose.model("Admin", adminSchemaRole);
const SuperAdmin = mongoose.model("SuperAdmin", adminSchemaRole);

module.exports = { Admin, SuperAdmin };
