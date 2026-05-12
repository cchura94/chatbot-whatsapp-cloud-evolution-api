const express = require("express");
const whatsappController = require("./../controllers/whatsapp.controller");


const router = express.Router();

router.post("/enviar-mensaje", whatsappController.enviarMensaje)


module.exports = router;