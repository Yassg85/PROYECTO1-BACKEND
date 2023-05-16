import express from 'express';
import Product from '../models/product';
import { getIdFromToken } from "../utils/auth";
import { verifyAdmin } from "../middlewares/auth";

const router = express.Router();
const _ = require('underscore');

router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "";
    const name = req.query.name || "";

    const nameRegex = /name/gi;
    const categoryRegex = /category/gi;

    let products = await Product.find({
      name: { $regex: nameRegex },
      category: { $regex: categoryRegex }
    });

    if (products.length === 0) {
      return res.status(400).json({
        mensaje: "No hay productos",
        error,
      });
    }

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(400).json({
        mensaje: "El producto no existe",
        error,
      });
    }

    return res.json({ product });
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

    const product = new Product({
      name: body.name,
      price: body.price,
      category: body.category,
      restaurant: body.restaurant,
    });

    const productDB = await product.save();

    return res.json(productDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.put("/:productId", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = getIdFromToken(req.headers.authorization);

    const product = await Product.findOne({ _id: productId }).populate("restaurant")

    if (!product) {
      return res.status(400).json({
        mensaje: "El producto no existe",
        error,
      });
    }

    if (product.restaurant.admin != userId) {
      return res.status(400).json({
        mensaje: "No tienes permisos para actualizar este producto",
        error,
      });
    }

    const body = _.pick(req.body, ["name", "price", "category"]);

    const productDB = await Product.findByIdAndUpdate(
      { _id: productId },
      body,
      { new: true, runValidators: true, context: "query" }
    );

    return res.json(productDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.delete("/:productId", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = getIdFromToken(req.headers.authorization);

    const product = await Product.findOne({ _id: productId }).populate("restaurant")

    if (!product) {
      return res.status(400).json({
        mensaje: "El producto no existe",
        error,
      });
    }

    if (product.restaurant.admin != userId) {
      return res.status(400).json({
        mensaje: "No tienes permisos para eliminar este producto",
        error,
      });
    }

    const productDB = await Product.findByIdAndDelete({ _id: productId });

    return res.json(productDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

// Exportamos la configuración de express app
module.exports = router;