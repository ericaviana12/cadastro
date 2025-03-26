/**
 * Modelo de dados das notas
 * Criação da coleção
 */

// Importação dos recursos do mongoose
const { model, Schema, version } = require('mongoose')

// Criação da estrutura da coleção
const cadastroSchema = new Schema({
    nome: {
        type: String
    },
    cpf: {
        type: String,
        unique: true,
        index: true
    },
    email: {
        type: String
    },
    fone: {
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
    }
}, { versionKey: false })

// Exportar o modelo de dados para o main
module.exports = model('Clientes', cadastroSchema)
