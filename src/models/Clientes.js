/**
 * Modelos de dados das notas
 * Ciração da coleção
 */

//Importação do rescuros do mongoose
const { model, Schema } = require('mongoose')


//Criação da estrutura da coleção
const clientesSchema = new Schema({
    nome: {
        type: String,
    },
    cpf: {
        type: String,
    },
    email: {
        type: String
    },
    telefone: {
        type: String
    },
    cep: {
        type: String
    },
    logradouro: {
        type: String
    },
    numero: {
        type: String
    },
    complemento: {
        type: String
    },
    bairro: {
        type: String
    },
    cidade: {
        type: String
    },
    uf: {
        type: String
    },
}, { versionKey: false })

//exportar o modelo de dados para main
module.exports = model('Clientes', clientesSchema)