import express from 'express';
import Order from '../models/order';
import { getIdFromToken } from "../utils/auth";
import { verifyClient } from "../middlewares/auth";
import _ from 'underscore';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    //El endpoint retorna los datos de los pedidos realizados por el usuario proveído, enviados por el usuario proveído, pedidos a un restaurante proveído, y/o entre las fechas proveídas.
    const userId = req.query.userId;
    const sentBy = req.query.sentBy;
    const restaurantId = req.query.restaurantId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = {};

    if (userId) {
      query.user = userId;
    }

    if (sentBy) {
      query.sentBy = sentBy;
    }

    if (restaurantId) {
      query.restaurant = restaurantId;
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query);

    if (orders.length === 0) {
      return res.status(400).json({
        mensaje: "No hay pedidos",
        error,
      });
    }

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.get("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(400).json({
        mensaje: "El pedido no existe",
        error,
      });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.get("/delivered", async (req, res) => {
  try {
    const orders = await Order.find({ status: "DELIVERED" });

    if (orders.length === 0) {
      return res.status(400).json({
        mensaje: "No hay pedidos enviados",
        error,
      });
    }

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.post("/", verifyClient, async (req, res) => {
  try {
    const { restaurantId, products } = req.body;

    const order = new Order({
      restaurant: restaurantId,
      products: products,
    });

    await order.save();

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.put("/:orderId", verifyClient, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = getIdFromToken(req.headers.authorization);

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(400).json({
        mensaje: "El pedido no existe",
        error,
      });
    }

    if (order.status === "DELIVERED") {
      return res.status(400).json({
        mensaje: "El pedido ya fue despachado",
        error,
      });
    }

    if (order.user != userId) {
      return res.status(400).json({
        mensaje: "El pedido no pertenece al usuario",
        error,
      });
    }

    const body = _.pick(req.body, ["status", "domiciliary", "products"]);

    const orderDB = await Order.findByIdAndUpdate(
      orderId,
      body,
      { new: true, runValidators: true, context: "query" },
    )
    
    return res.json({ order: orderDB });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.delete("/:orderId", verifyClient, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = getIdFromToken(req.headers.authorization);

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(400).json({
        mensaje: "El pedido no existe",
        error,
      });
    }

    if (order.status === "DELIVERED") {
      return res.status(400).json({
        mensaje: "El pedido ya fue despachado",
        error,
      });
    }

    if (order.user != userId) {
      return res.status(400).json({
        mensaje: "El pedido no pertenece al usuario",
        error,
      });
    }

    await Order.findByIdAndRemove(orderId);

    return res.json({ mensaje: "Pedido eliminado" });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

// Exportamos la configuración de express app
module.exports = router;