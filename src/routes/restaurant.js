import express from "express";
import Restaurant from "../models/restaurant";
import { getIdFromToken } from "../utils/auth";
import { verifyAdmin } from "../middlewares/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "";
    const name = req.query.name || "";

    const nameRegex = /name/gi;

    let restaurants = [];
    if (category) {
      restaurants = await Restaurant.find({ 
        category: category, 
        name: { $regex: nameRegex } 
      });
    }else{
      restaurants = await Restaurant.find({ 
        name: { $regex: nameRegex } 
      });
    }

    if (restaurants.length === 0) {
      return res.status(400).json({
        mensaje: "No hay restaurantes",
        error,
      });
    }

    return res.json({restaurants});
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(400).json({
        mensaje: "El restaurante no existe",
        error,
      });
    }

    return res.json({restaurant});
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.post("/", verifyAdmin, async (req, res) => {
  try {
    const body = req.body;

    const restaurant = new Restaurant({
      name: body.name,
      category: body.category,
      admin: body.admin,
    });

    const restaurantDB = await restaurant.save();

    return res.json({restaurantDB});
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.put("/:restaurantId", verifyAdmin, async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const userId = getIdFromToken(req.headers.authorization);

    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(400).json({
        mensaje: "El restaurante no existe",
        error,
      });
    }

    if (restaurant.admin != userId) {
      return res.status(400).json({
        mensaje: "No tienes permisos para editar este restaurante",
        error,
      });
    }

    restaurant.name = req.body.name;
    restaurant.category = req.body.category;

    await restaurant.save();

    return res.json({restaurant});

  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.delete("/:restaurantId", verifyAdmin, async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const userId = getIdFromToken(req.headers.authorization);

    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(400).json({
        mensaje: "El restaurante no existe",
        error,
      });
    }

    if (restaurant.admin != userId) {
      return res.status(400).json({
        mensaje: "No tienes permisos para eliminar este restaurante",
        error,
      });
    }

    const restaurantDB = await Restaurant.findByIdAndRemove(restaurantId);

    if (!restaurantDB) {
      return res.status(400).json({
        mensaje: "El restaurante no existe",
        error,
      });
    }

    return res.json({restaurantDB});
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

// Exportamos la configuración de express app
module.exports = router;