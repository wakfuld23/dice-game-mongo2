const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const anonimId = require('../utils/anonimId');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const createUser = async (userBody) => {
  if (Object.keys(userBody).length === 0) {
    const id = anonimId();
    return User.create({ name: `ANÒNIM-${id}` });
  }
  if (await User.isNameTaken(userBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  return User.create(userBody);
};

/**
 * Update a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const updateUser = async (userBody, userParams) => {
  if (await User.isNameTaken(userBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'That name already exists');
  }

  if (await User.isNameTaken(userParams.name)) {
    if (userParams.name === 'admin') throw new ApiError(httpStatus.BAD_REQUEST, "Can't modify admin name");
    await User.updateOne({ name: userParams.name }, { name: userBody.name });
    return User.findOne({ name: userBody.name });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, "Name dosen't exsist");
};

/**
 * Get user by name
 * @param {string} name
 * @returns {Promise<User>}
 */
const getUserByName = async (name) => {
  return User.findOne({ name });
};

module.exports = {
  createUser,
  getUserByName,
  updateUser,
};
