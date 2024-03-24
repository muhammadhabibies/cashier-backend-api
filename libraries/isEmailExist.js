import User from "../models/User.js";

const isEmailExist = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return false;
  return true;
};

const isEmailExistWithUserId = async (id, email) => {
  const user = await User.findOne({ email, _id: { $ne: id } }); // $ne adalah not equal, untuk cek apakah email sesuai dengan id, ini itu untuk update di UserController

  if (!user) return false;
  return true;
};

export { isEmailExist, isEmailExistWithUserId };
