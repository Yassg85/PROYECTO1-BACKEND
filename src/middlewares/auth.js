const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      mensaje
    });
  }
  jwt.verify(token, "seguro", (error, decoded) => {
    if (error) {
      return res.status(401).json({
        mensaje: "No autorizado",
      });
    }

    req.userId = decoded.id;

    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      mensaje
    });
  }
  jwt.verify(token, "seguro", async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        mensaje: "No autorizado",
      });
    }

    if (decoded.role === "ADMIN") {
      const restaurantId = req.params.restaurantId;

      const restaurant = await Restaurant.findOne({ _id: restaurantId });

      if (!restaurant) {
        return res.status(400).json({
          mensaje: "El restaurante no existe",
          error,
        });
      }else{
        if(restaurant.admin === decoded.id){
          next();
          return;
        }else{
          return res.status(401).json({
            mensaje: "No autorizado",
          });
        }
      }
    }

    return res.status(401).json({
      mensaje: "No autorizado",
    });
  });
}

const verifyClient = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      mensaje
    });
  }
  jwt.verify(token, "seguro", async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        mensaje: "No autorizado",
      });
    }

    if (decoded.role === "CLIENT") {
      next();
      return;
    }

    return res.status(401).json({
      mensaje: "No autorizado",
    });
  });
}

module.exports = {verifyToken, verifyAdmin, verifyClient};