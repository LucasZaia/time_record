const { where } = require('sequelize');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const { decodeToken } = require('../security/decoder');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.getUserByHash = async (user_hash) => {
  try {
    const user = await User.findOne( { where: { user_hash: user_hash } });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};
// Create a new user
exports.createUser = async (req, res) => {
  try {
  const hash = Math.random().toString(36).substring(2, 9);
    console.log(hash);

    const newUser = await User.create({
      name: req.body.name,
      user_hash: hash,
      email: req.body.email,
      password: req.body.password
    });
  
    res.status(200).json({message: 'Usuário criado com sucesso', user_hash: newUser.user_hash});
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_hash: user.user_hash
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

exports.findUserByToken = async (token) => {
  try {
    const decodedToken = decodeToken(token);
    const user = await User.findOne({ where: { id: decodedToken.id } });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      user_hash: user.user_hash
    };
  } catch (error) {
    return null;
  }
};