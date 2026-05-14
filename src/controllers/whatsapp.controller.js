const whatsappService = require("./../services/whatsapp.service");
const aiService = require("./../services/aiService");


const historialIA = [];
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

const userContext = {};

async function recibirMensajeWebhook(req, res) {

    try {

        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value?.messages) {
            return res.sendStatus(200);
        }

        const message = value.messages[0];

        const numero = message.from;

        let mensajeUsuario = "";

        // TEXTO
        if (message.type === "text") {

            mensajeUsuario =
                message.text.body;
        }

        // BOTONES
        else if (message.type === "interactive") {

            mensajeUsuario =
                message.interactive.button_reply.id;
        }

        console.log("Usuario:", numero);
        console.log("Mensaje:", mensajeUsuario);

        await procesarMensaje(
            numero,
            mensajeUsuario
        );

        return res.sendStatus(200);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


async function enviarMenu(numero, menuKey) {

    const menu = menuData[menuKey];

    const botones = Object.entries(menu.opciones)
        .slice(0, 3)
        .map(([key, option]) => ({
            type: "reply",
            reply: {
                id: key,
                title: option.text.substring(0, 20)
            }
        }));

    await whatsappService.enviarMensajeWhatsapp(numero, {
        type: "buttons",
        body: menu.mensaje,
        buttons: botones
    });
}

async function procesarMensaje(numero, mensajeUsuario) {

    mensajeUsuario = mensajeUsuario.trim().toUpperCase();

    // usuario nuevo
    if (!userContext[numero]) {

        userContext[numero] = {
            menuActual: "main"
        };

        await enviarMenu(numero, "main");
        return;
    }

    const menuActual = userContext[numero].menuActual;

    const menu = menuData[menuActual];

    const opcionSeleccionada =
        menu.opciones[mensajeUsuario];

    // opcion válida
    if (opcionSeleccionada) {

        // enviar respuesta
        if (opcionSeleccionada.respuesta) {

            await whatsappService.enviarMensajeWhatsapp(
                numero,
                opcionSeleccionada.respuesta
            );
        }

        // submenu
        if (opcionSeleccionada.submenu) {

            userContext[numero].menuActual =
                opcionSeleccionada.submenu;

            await enviarMenu(
                numero,
                opcionSeleccionada.submenu
            );
        }

    } else {

        // IA


        // 'necesito que determnines la intencion del mensaje de mi cliente, mis intenciones son: ["información", "precios", "servicios", "ubicacion", "horarios"]. como respuesta solo responde la intencion del cliente y no se entiende entonces responde "NOSE".'
        const resp = await aiService.generarRespuestaAI(mensajeUsuario, historialIA, "Actual como parte del equipo de ventas para ofrecer capacitaciones de postgrado oferta nustros diplomados. responde en no más de 30 palabras e ignora preguntas que no sea de nuestros servicios" );
            console.log(resp.respuesta)

            historialIA.push(...resp.nuevoHistorial.splice(-10));

            console.log("*****: HISORIAL:  ",historialIA);
            await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: resp.respuesta
            });
            /*
        switch (resp.respuesta) {
            case "información":

                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: "Nosotros somos una empresa y ofrecemos cursos, le envío el catalogo "
                });

                await whatsappService.enviarMensajeWhatsapp(numero, {
                        type: "image",
                        "link": "https://blumbitvirtual.edtics.com/pluginfile.php/5663/course/overviewfiles/Post%20N8N%20%281%29.png",
                        "caption": "Hola, le envio la imagen del *curso n8n*"    
                });
                break;
            case "precios":
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: "Los precios varian...."
                });
                
                break;
        
            default:
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: "Hola, necesitas alguna ayuda? escribe su solicitud"
                });
                break;
        }
                */


        // await enviarMenu(numero, menuActual);
    }
}


const menuData = {
    main: {
        mensaje:
            "🎓 Hola 👋 Bienvenid@ a *PostgradoBot*\n\nSelecciona una opción:",
        opciones: {
            A: {
                text: "📚 Programas de Postgrado",
                submenu: "programas"
            },

            B: {
                text: "💳 Costos y Pagos",
                submenu: "pagos"
            },

            C: {
                text: "📝 Inscripciones",
                submenu: "inscripciones"
            },

            D: {
                text: "🛠 Soporte",
                submenu: "soporte"
            },

            E: {
                text: "📍 Ubicación",
                respuesta: {
                    type: "location",
                    latitude: "-16.5",
                    longitude: "-68.1333",
                    name: "Instituto de Postgrado",
                    address: "Av. Central, La Paz Bolivia"
                }
            },

            F: {
                text: "🕒 Horarios de Atención",
                respuesta: {
                    type: "image",
                    link:
                        "https://tusitio.com/horarios.png",
                    caption:
                        "📅 Horarios de atención"
                }
            }
        }
    },

    // =========================
    // PROGRAMAS
    // =========================
    programas: {
        mensaje:
            "🎓 Nuestros Programas\n\nSelecciona una opción:",
        opciones: {
            1: {
                text: "MBA Ejecutivo",
                submenu: "mba"
            },

            2: {
                text: "Diplomado en Educación Superior",
                submenu: "educacion"
            },

            3: {
                text: "Maestría en Finanzas",
                submenu: "finanzas"
            },

            4: {
                text: "⬅ Volver al menú",
                submenu: "main"
            }
        }
    },

    // =========================
    // MBA
    // =========================
    mba: {
        mensaje:
            "📘 MBA Ejecutivo\n\nSelecciona una opción:",
        opciones: {
            1: {
                text: "📄 Información",
                respuesta: {
                    type: "text",
                    body:
                        "El MBA Ejecutivo está dirigido a profesionales que buscan fortalecer liderazgo y gestión empresarial."
                }
            },

            2: {
                text: "💰 Precio",
                respuesta: {
                    type: "text",
                    body:
                        "💵 Precio total: Bs. 12.000\n📌 Inscripción: Bs. 500"
                }
            },

            3: {
                text: "📥 Descargar Brochure",
                respuesta: {
                    type: "document",
                    link:
                        "https://tusitio.com/brochure-mba.pdf",
                    filename: "MBA_Ejecutivo.pdf"
                }
            },

            4: {
                text: "📝 Inscribirme",
                submenu: "inscripciones"
            },

            5: {
                text: "⬅ Volver",
                submenu: "programas"
            }
        }
    },

    // =========================
    // EDUCACION
    // =========================
    educacion: {
        mensaje:
            "📘 Diplomado en Educación Superior",
        opciones: {
            1: {
                text: "📄 Información",
                respuesta: {
                    type: "text",
                    body:
                        "Programa orientado a docentes y profesionales del área educativa."
                }
            },

            2: {
                text: "💰 Precio",
                respuesta: {
                    type: "text",
                    body:
                        "💵 Precio: Bs. 4.500"
                }
            },

            3: {
                text: "⬅ Volver",
                submenu: "programas"
            }
        }
    },

    // =========================
    // FINANZAS
    // =========================
    finanzas: {
        mensaje:
            "📘 Maestría en Finanzas",
        opciones: {
            1: {
                text: "📄 Información",
                respuesta: {
                    type: "text",
                    body:
                        "Especialización en gestión financiera y mercados."
                }
            },

            2: {
                text: "💰 Precio",
                respuesta: {
                    type: "text",
                    body:
                        "💵 Precio: Bs. 10.000"
                }
            },

            3: {
                text: "⬅ Volver",
                submenu: "programas"
            }
        }
    },

    // =========================
    // PAGOS
    // =========================
    pagos: {
        mensaje:
            "💳 Métodos de Pago",
        opciones: {
            1: {
                text: "🏦 Transferencia Bancaria",
                respuesta: {
                    type: "text",
                    body:
                        "Banco Unión\nCuenta: 123456789"
                }
            },

            2: {
                text: "📱 QR",
                respuesta: {
                    type: "image",
                    link:
                        "https://tusitio.com/qr.png",
                    caption:
                        "Escanea el QR para realizar tu pago"
                }
            },

            3: {
                text: "⬅ Volver",
                submenu: "main"
            }
        }
    },

    // =========================
    // INSCRIPCIONES
    // =========================
    inscripciones: {
        mensaje:
            "📝 Inscripciones",
        opciones: {
            1: {
                text: "📋 Requisitos",
                respuesta: {
                    type: "text",
                    body:
                        "• CI\n• Título profesional\n• Formulario de inscripción"
                }
            },

            2: {
                text: "🌐 Formulario Online",
                respuesta: {
                    type: "text",
                    body:
                        "👉 https://tusitio.com/inscripciones"
                }
            },

            3: {
                text: "👨‍💼 Hablar con Asesor",
                respuesta: {
                    type: "text",
                    body:
                        "📞 WhatsApp: +591 70000000"
                }
            },

            4: {
                text: "⬅ Volver",
                submenu: "main"
            }
        }
    },

    // =========================
    // SOPORTE
    // =========================
    soporte: {
        mensaje:
            "🛠 Centro de Soporte",
        opciones: {
            1: {
                text: "❓ Problemas con pagos",
                respuesta: {
                    type: "text",
                    body:
                        "Si tu pago no se reflejó, envía tu comprobante al WhatsApp soporte."
                }
            },

            2: {
                text: "🔑 Problemas de acceso",
                respuesta: {
                    type: "text",
                    body:
                        "Si olvidaste tu contraseña, solicita recuperación."
                }
            },

            3: {
                text: "👨‍💻 Soporte Técnico",
                respuesta: {
                    type: "text",
                    body:
                        "📞 Soporte: +591 71111111"
                }
            },

            4: {
                text: "⬅ Volver",
                submenu: "main"
            }
        }
    }
};
/*
const menuData = {
    main: {
        mensaje:
            "Hola 👋 Bienvenid@ a *miBot*\n\nSelecciona una opción:",
        opciones: {
            A: {
                text: "Nuestros Servicios",
                submenu: "servicios"
            },
            B: {
                text: "Nuestra Ubicación",
                respuesta: {
                    type: "location",
                    latitude: "-16.5",
                    longitude: "-68.1333",
                    name: "La Paz Bolivia",
                    address: "Av. Central"
                }
            },
            C: {
                text: "Ver Horarios",
                respuesta: {
                    type: "image",
                    link:
                        "https://iicca.edu.bo/wp-content/uploads/2025/02/Post-para-instagram-horario-moderno-azul-1.png",
                    caption:
                        "Estos son nuestros horarios"
                }
            }
        }
    },

    servicios: {
        mensaje:
            "📚 Nuestros servicios\n\nSelecciona una opción:",
        opciones: {
            1: {
                text: "Asesoramiento",
                respuesta: {
                    type: "text",
                    body:
                        "El servicio de asesoramiento consiste en..."
                }
            },

            2: {
                text: "Catálogo",
                respuesta: {
                    type: "document",
                    link:
                        "https://proyectanda.com/Catalogo_Proyectanda-Imprenta_Digital.pdf",
                    filename: "catalogo.pdf"
                }
            },

            3: {
                text: "Volver al menú",
                submenu: "main"
            }
        }
    }
};
*/


module.exports = {
    enviarMensaje,
    recibirMensajeWebhook
}