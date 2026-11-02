const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedToken();

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendTokenResponse;
