const whatsappService = require("./../services/whatsapp.service");

async function enviarMensaje(req, res){
    try {
        const { numero, mensaje } = req.body;
        if(!numero || !mensaje){
            return res.status(400).json({success: false, error: "Debes enviar un número y un mensaje"});
        }

        const response = await whatsappService.enviarMensajeWhatsapp(numero, mensaje);

        return res.status(200).json({success: true, data: response});

    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, error: error.message});
    }
}

async function recibirMensajeWebhook(req, res) {
    try {

        console.log(JSON.stringify(req.body, null, 2));

        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value?.messages) {
            return res.status(200).send("No mensaje");
        }

        const message = value.messages[0];
        const numero = message.from;

        let tipoMensaje = message.type;

        // =========================================
        // MENSAJES DE TEXTO
        // =========================================
        if (tipoMensaje === "text") {

            let texto = message.text.body.toLowerCase().trim();

            console.log("Mensaje usuario:", texto);

            // SALUDO
            if (
                texto.includes("hola") ||
                texto.includes("buenas") ||
                texto.includes("inicio") ||
                texto.includes("menu")
            ) {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "buttons",
                    body:
                        "🎓 *Bienvenido al Centro de Postgrado*\n\n" +
                        "¿Qué deseas realizar?",
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "ventas",
                                title: "📚 Cursos"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "soporte",
                                title: "🛠 Soporte"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "ubicacion",
                                title: "📍 Ubicación"
                            }
                        }
                    ]
                });
            }

            // CURSOS
            else if (
                texto.includes("curso") ||
                texto.includes("ventas")
            ) {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "buttons",
                    body:
                        "📚 *Cursos de Postgrado Disponibles*\n\n" +
                        "Selecciona un área:",
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "curso_dev",
                                title: "💻 Desarrollo"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "curso_data",
                                title: "📊 Data Science"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "curso_ai",
                                title: "🤖 IA"
                            }
                        }
                    ]
                });
            }

            // SOPORTE
            else if (
                texto.includes("soporte") ||
                texto.includes("ayuda")
            ) {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "🛠 *Soporte Técnico*\n\n" +
                        "Un asesor responderá en breve.\n\n" +
                        "Describe tu problema."
                });
            }

            // UBICACION
            else if (
                texto.includes("ubicacion") ||
                texto.includes("dirección")
            ) {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "location",
                    latitude: "-16.5",
                    longitude: "-68.1333",
                    name: "Centro de Postgrado",
                    address: "La Paz, Bolivia"
                });
            }

            // DEFAULT
            else {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "❌ No entendí tu mensaje.\n\n" +
                        "Escribe *menu* para ver opciones."
                });
            }
        }

        // =========================================
        // RESPUESTAS DE BOTONES
        // =========================================
        else if (tipoMensaje === "interactive") {

            const buttonReply =
                message.interactive?.button_reply;

            const id = buttonReply?.id;

            console.log("Botón:", id);

            // =====================================
            // VENTAS
            // =====================================
            if (id === "ventas") {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "buttons",
                    body:
                        "📚 *Cursos Disponibles*\n\n" +
                        "Selecciona una categoría:",
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "curso_dev",
                                title: "💻 Desarrollo"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "curso_data",
                                title: "📊 Data"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "curso_ai",
                                title: "🤖 IA"
                            }
                        }
                    ]
                });
            }

            // =====================================
            // SOPORTE
            // =====================================
            else if (id === "soporte") {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "🛠 Un asesor de soporte responderá pronto.\n\n" +
                        "Describe el inconveniente."
                });
            }

            // =====================================
            // UBICACION
            // =====================================
            else if (id === "ubicacion") {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "location",
                    latitude: "-16.5",
                    longitude: "-68.1333",
                    name: "Centro de Postgrado",
                    address: "La Paz, Bolivia"
                });
            }

            // =====================================
            // CURSO DESARROLLO
            // =====================================
            else if (id === "curso_dev") {

                // Imagen del curso
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "image",
                    link: "https://blumbitvirtual.edtics.com/pluginfile.php/5663/course/overviewfiles/Post%20N8N%20%281%29.png",
                    caption:
                        "💻 *Diplomado en Desarrollo de Software*\n\n" +
                        "✅ Modalidad Virtual\n" +
                        "✅ Certificación\n" +
                        "✅ Clases en Vivo"
                });

                // Mensaje adicional
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "📌 Precio: 350 Bs\n" +
                        "📅 Inicio: 20 Mayo\n\n" +
                        "Escribe *inscribirme* para registrarte."
                });
            }

            // =====================================
            // CURSO DATA
            // =====================================
            else if (id === "curso_data") {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "📊 *Diplomado en Data Science*\n\n" +
                        "Python, Machine Learning y Power BI.\n\n" +
                        "Costo: 400 Bs"
                });
            }

            // =====================================
            // CURSO IA
            // =====================================
            else if (id === "curso_ai") {

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body:
                        "🤖 *Especialización en Inteligencia Artificial*\n\n" +
                        "ChatGPT, IA Generativa y Automatización.\n\n" +
                        "Costo: 500 Bs"
                });
            }
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    enviarMensaje,
    recibirMensajeWebhook
}