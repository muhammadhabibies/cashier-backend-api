const role = (user) => {
  return function (req, res, next) {
    try {
      // console.log(req.jwt); // req.jwt ini dari middleware jwtAuth.js yang success
      if (user.includes(req.jwt.role)) {
        next();
      } else {
        throw { message: "UNAUTHORIZED_ROLE" };
      }
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: "UNAUTHORIZED_ROLE",
      });
    }
  };
};

export default role;
