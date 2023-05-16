const jwt = require("jsonwebtoken");

const getIdFromToken = (token) => {
  const decoded = jwt.verify(token, "seguro");
  return decoded.id;
};

module.exports = {getIdFromToken};