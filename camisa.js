// Ejemplo de esquema Camiseta (simplificado)

const CamisetaSchema = new Schema({

creador: String,

torsoColor: String,
mangaIzquierdaColor: String,

mangaDerechaColor: String,

cuelloColor: String,

fechaCreacion: { type: Date, default: Date.now },

calificacion: { type: Number, default: 0 }

});

// Crear el modelo Usuario basado en el esquema

const Camiseta = model('Camiseta', CamisetaSchema);

module.exports = Camiseta;