const Transaction = require("../models/transaction.js");
const User = require("../models/user.js");

const createTransaction = async (req, res) => {
  try {
    const { amount, type, status, name, email, phone = "", order } = req.body;
    console.log(amount, type, status, name, email, phone, order);
    const transaction = new Transaction({
      order,
      amount,
      type,
      status,
      name,
      email,
      phone,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 5;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find().skip(skip).limit(limit);
    const total = await Transaction.countDocuments();
    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, status, description, user } = req.body;
    const transaction = {
      amount,
      type,
      status,
      description,
      user,
    };
    await Transaction.findByIdAndUpdate(id, transaction, { new: true });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.status(204).json("Transaction deleted successfully.");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
