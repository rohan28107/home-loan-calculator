const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_EXPIRY = "30d";

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken };
