import express from "express";
import User from "../models/user.js";

const router = express.Router();
const _ = require('underscore');

// Hash Contraseña
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Token
const jwt = require('jsonwebtoken');

router.post("/login", async (req, res) => {
  const body = req.body;
  try {
    if (body.id) {
      //Evaluar si el id existe
      const user = await User.findOne({ _id: body.id });

      if (!user) {
        return res.status(400).json({
          mensaje: "El id no existe",
          error,
        });
      }

    } else {
      //Evaluar si el email existe
      const user = await User.findOne({ email: body.email });

      if (!user) {
        return res.status(400).json({
          mensaje: "Usuario o contraseña incorrectos - email",
          error,
        });
      }

      //Evaluar si la contraseña es correcta
      if (!bcrypt.compareSync(body.password, user.password)) {
        return res.status(400).json({
          mensaje: "Usuario o contraseña incorrectos - password",
          error,
        });
      }
    }

    //Generar el token
    const token = jwt.sign({
      data: user
    }, 'seguro', { expiresIn: 60 * 60 * 3 });

    res.json({ user, token });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.post("/register", async (req, res) => {
  const body = req.body;
  try {
    //Evaluar si el email existe
    const user = await User.findOne({ email: body.email });

    if (user) {
      return res.status(400).json({
        mensaje: "El email ya existe",
        error,
      });
    }

    //Encriptar la contraseña
    const salt = bcrypt.genSaltSync(saltRounds);
    body.password = bcrypt.hashSync(body.password, salt);

    //Registrar el usuario
    const userDB = await User.create(body);

    //Generar el token
    const token = jwt.sign({
      data: userDB
    }, 'seguro', { expiresIn: 60 * 60 * 3 });

    res.json({ userDB, token });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.put("/user/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    //escoger los campos del body que se pueden actualizar
    const body = _.pick(req.body, ['name', 'email', 'password', 'phoneNumber', 'role']);

    if (body.password) {
      //Encriptar la contraseña
      const salt = bcrypt.genSaltSync(saltRounds);
      body.password = bcrypt.hashSync(body.password, salt);
    }

    //Actualizar el usuario
    const userDB = await User.findByIdAndUpdate(
      _id,
      body,
      { new: true, runValidators: true, context: 'query' }
    );

    return res.json(userDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
});

router.delete("/user/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    //Eliminar el usuario
    await User.findByIdAndDelete({ _id });

    return res.json({
      mensaje: "Usuario eliminado",
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Ocurrio un error",
      error,
    });
  }
})


// Exportamos la configuración de express app
module.exports = router;