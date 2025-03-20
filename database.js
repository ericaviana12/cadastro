/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose
 */

// Importação do mongoose
// Não esquecer de instalar o módulo (npm i mongoose)
const mongoose = require('mongoose')

// Configuração do banco de dados
// ip/link do servidor, autenticação
// Ao final da url definir o nome do banco de dados
// Exemplo: /dbclientes
const url = 'mongodb+srv://admin:123Senac@ericaviana12.ozwku.mongodb.net/dbcadastro'

// Validação (evitar a abertura de várias conexões)
let conectado = false

// Método para conectar com o banco de dados
const conectar = async () => {
    // Se não estiver conectado
    if (!conectado) {
        // Conectar com o banco de dados
        try {
            await mongoose.connect(url) // Conectar
            conectado = true // Setar a variável
            console.log("MongoDB Conectado")
            return true // Verificação do main
        } catch (error) {
            console.log(error)
            return false // Verificação do main
        }
    }
}

// Método para desconectar com o banco de dados
const desconectar = async () => {
    // Se estiver conectado
    if (conectado) {
        // Desconectar do banco de dados
        try {
            await mongoose.disconnect(url) // Desconectar
            conectado = false // Setar a variável
            console.log("MongoDB Desconectado")
        } catch (error) {
            console.log(error)
        }
    }
}

// Exportar para o main os métodos conectar e desconectar
module.exports = {conectar, desconectar}
