const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage", // Required for popup-based auth code flow
);

/**
 * Exchanges a Google authorization code for tokens, then
 * cryptographically verifies the returned id_token.
 *
 * This is the Authorization Code Flow — the most secure approach
 * because the Client Secret never leaves the server, and no
 * access/id tokens are ever exposed to the browser.
 */
const exchangeCodeForTokens = async (code) => {
  try {
    // Exchange the one-time auth code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify the id_token cryptographically (no HTTP call needed)
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired Google authorization code");
  }
};

const generateToken = (userId) => {
  let expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  // Remove any accidental quotes or spaces from Railway env vars
  expiresIn = expiresIn.replace(/['"]/g, "").trim();

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const googleLogin = async (code) => {
  const payload = await exchangeCodeForTokens(code);

  const { sub: googleId, email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw new ApiError(401, "Google email is not verified");
  }

  let user = await User.findOne({
    $or: [{ email }, { googleId }],
  });

  if (user) {
    user.googleId = googleId;
    if (picture) user.avatar = picture;
    if (name) user.name = name;

    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture || "",
    });
  }

  const token = generateToken(user._id);

  return { user, token };
};

module.exports = {
  googleLogin,
  exchangeCodeForTokens,
  generateToken,
};
