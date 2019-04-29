const pendingModels = require('../models');
const config = require('../../config');
const {Op} = require('sequelize');
const {redisClient, secretHash} = require('../utils');
const uniqueUUID = require('uuid/v1');
const randomUUID = require('uuid/v4');

async function getUserByToken(token, identifier) {
  const {user: User} = await pendingModels;
  const id = parseInt(await redisClient.hashGet(token, identifier));
  if (Number.isNaN(id)) return null;
  return await User.findByPk(id);
}

async function hashPassword(username, password) {
  const salt = typeof config.database.salt === 'function' ?
    await config.database.salt(username) :
    config.database.salt.toString();
  return await secretHash(password.mix(salt), salt);
}

async function createUser(options = {username: '', password: '', description: ''}) {
  const {user: User} = await pendingModels;
  const encrypted = await hashPassword(options.username, options.password);
  const [theUser, created] = await User.findOrCreate({
    where: {username: options.username},
    defaults: Object.assign(options, {password: encrypted}),
  });
  return created ? theUser : null;
}

async function validateUser(username, password) {
  const {user: User} = await pendingModels;
  const theUser = await User.findOne({where: {username}});
  if (!theUser) return {status: false};
  return {status: await hashPassword(username, password) === theUser.getDataValue('password'), theUser};
}

async function login(username, password, deviceIdentifier) {
  const {status: success, theUser} = await validateUser(username, password);
  if (!success) return false;
  const token = `${uniqueUUID()}`.mix(randomUUID());
  await redisClient.hashSet(token, deviceIdentifier, theUser.getDataValue('id'));
  return token;
}

async function logout(token, deviceIdentifier) {
  if (!deviceIdentifier) return await redisClient.expire(token);
  return await redisClient.hashSet(token, deviceIdentifier, 'null');
}

async function getUser({username = null, id = null}) {
  const {user: User} = await pendingModels;
  return await User.findOne({where: {[Op.or]: [{username}, {id}]}});
}

module.exports = {
  name: 'User',
  getUserByToken,
  createUser,
  validateUser,
  login,
  logout,
  getUser,
  hashPassword,
};
