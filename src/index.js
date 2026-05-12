require('dotenv').config()
const express = require("express");
const routes = require("./routes/index");
const app = express();

app.use(express.json());

app.get("/", function(req, res){
    console.log("NOMBRE: ", req.query.nombre, " PAIS: ", req.query.pais);

    return res.json({mensaje: "Hola "+req.query.nombre+", saludos a: "+req.query.pais});
});

app.use("/api", routes);

app.listen(3000, function(){
    console.log("Servidor iniciado en: 3000");
});
