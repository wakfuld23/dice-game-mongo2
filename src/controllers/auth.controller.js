const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService, authService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({
    user: {
      id: user._id,
      name: user.name,
    },
    tokens,
  });
});

const login = catchAsync(async (req, res) => {
  const { name, password } = req.body;
  const user = await authService.loginUserWithNameAndPassword(name, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const loginAdmin = catchAsync(async (req, res) => {
  const { name, password } = req.body;
  const user = await authService.loginUserWithNameAndPasswordAdmin(name, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({
    user: {
      id: user.id,
      name: user.name,
    },
    tokens,
  });
});

module.exports = {
  register,
  login,
  loginAdmin,
};
