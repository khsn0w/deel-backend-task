const { getProfileById } = require("../services/profile.service");
const getProfile = async (req, res, next) => {
  const profileId = req.get("profile_id");
  const connectedUserProfile = await getProfileById(profileId);
  if (!connectedUserProfile) return res.status(401).end();
  req.connectedUserProfile = connectedUserProfile;
  next();
};
module.exports = { getProfile };
