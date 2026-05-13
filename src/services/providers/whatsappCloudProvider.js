const axios = require("axios");

const whatsappUrl = process.env.WHATSAPP_URL;

const headers = {
  Authorization: "Bearer " + process.env.WHATSAPP_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

async function sendMessage(number, messageData) {
  const payload = buildPayload(number, messageData);
  const respuesta = await axios.post(whatsappUrl, payload, { headers });

  return respuesta.data;
}

function buildPayload(to, data) {
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
  };

  switch (data.type) {
    case "text":
      return { ...base, type: "text", text: { body: data.body } };
    case "image":
      return {
        ...base,
        type: "image",
        image: { link: data.link, caption: data.caption },
      };
    case "location":
      return {
        ...base,
        type: "location",
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          name: data.name,
          address: data.address,
        },
      };
    case "buttons":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: data.body },
          action: { buttons: data.buttons },
        },
      };
    case "document":
      return {
        ...base,
        type: "document",
        document: {
          link: data.link,
          caption: data.caption,
          filename: data.filename,
        },
      };
    case "listbuttons":
      return {
        ...base,
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: data.header,
          },
          body: {
            text: data.body,
          },
          footer: {
            text: data.footer,
          },
          action: { button: "Elige una opción", sections: data.sections },
        },
      };

    default:
      break;
  }
}

module.exports = {
  sendMessage,
};
