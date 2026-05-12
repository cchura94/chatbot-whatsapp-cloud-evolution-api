const cloudProvider = require("./whatsappCloudProvider");
const evolutionProvider = require("./whatsappEvolutionProvider");

const provider = process.env.WHATSAPP_PROVIDER || 'cloud' 

function getWhatsappProvider(){
    switch (provider) {
        case "cloud":
            return cloudProvider;
        case "evolution":
            return evolutionProvider;
    
        default:
            throw new Error("Proveedor de whatsapp no soportado")
    }
}

module.exports = getWhatsappProvider();