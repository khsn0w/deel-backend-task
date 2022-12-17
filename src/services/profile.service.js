const { Profile: ProfileModel } = require("../dataLayer");
const getProfileById = (profileId) => ProfileModel.findByPk(profileId);
module.exports = {
  getProfileById,
};
