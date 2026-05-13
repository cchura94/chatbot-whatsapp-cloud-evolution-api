const express = require("express");
const whatsappController = require("./../controllers/whatsapp.controller");


const router = express.Router();

const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;

router.post("/enviar-mensaje", whatsappController.enviarMensaje);

router.post("/webhook", whatsappController.recibirMensajeWebhook);

// verificar webhook
router.get("/webhook", function(req, res){
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if(mode === 'subscribe' && token === verify_token){
        console.log("WEBHOOK VERIFICADO...");
        return res.status(200).send(challenge);
    }else{
        return res.status(403).end();
    }
});


module.exports = router;