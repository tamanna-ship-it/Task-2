const bcrypt = require('bcryptjs');
const { dbQuery } = require('../config/db');

const findUserByEmail = async (email) => {
  return await dbQuery.getUserByEmail(email);
};

const findUserById = async (id) => {
  return await dbQuery.getUserById(id);
};

const getUserCount = async () => {
  return await dbQuery.getUserCount();
};

const createUser = async ({ email, passwordHash, role }) => {
  return await dbQuery.createUser({ email, passwordHash, role });
};

const validatePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  findUserByEmail,
  findUserById,
  getUserCount,
  createUser,
  validatePassword,
  sanitizeUser
};