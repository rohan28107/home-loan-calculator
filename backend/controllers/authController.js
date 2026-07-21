const User = require("../models/User");
const { hashPassword, comparePassword, signToken } = require("../utils/auth");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUserDTO(user) {
  return { id: user._id, email: user.email };
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = [];
    if (!email || !EMAIL_RE.test(email)) errors.push("A valid email is required");
    if (!password || password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (errors.length) return res.status(400).json({ errors });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ errors: ["Email is already registered"] });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash });

    const token = signToken(user._id.toString());
    return res.status(201).json({ token, user: toUserDTO(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/auth/signin ────────────────────────────────────────────────────
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ errors: ["Email and password are required"] });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ errors: ["Invalid email or password"] });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ errors: ["Invalid email or password"] });

    const token = signToken(user._id.toString());
    return res.json({ token, user: toUserDTO(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    return res.json({ user: toUserDTO(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, signin, me };
