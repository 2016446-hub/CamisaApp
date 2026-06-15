// Subesquema de Voto
const votoSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // referencia al usuario que votó
  valor: { type: Number, min: 1, max: 5 }                    // valor de 1 a 5
});
