/**
 * Processo de renderização do documento index.html
 */

console.log("Processo de renderização")

// inserção da data no rodapé
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

// Troca do ícone do banco de dados (status da conecão)
// Uso da API do preload.js
api.dbStatus((event, message) => {
    // Teste de recebimento da mensagem
    console.log(message)
    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon_branco.png"
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff_branco.png"
    }
})

// ============================================================

// Capturar o foco da caixa de texto
const foco = document.getElementById('inputNome')

// Alterar as propriedades do documento HTML ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    foco.focus() // Iniciar o documento com foco na caixa de texto
})

// Capturar os dados do formulário (Passo 1: fluxo)
let frmCadastro = document.getElementById('frmCadastro')
let nome = document.getElementById('inputNome')
let cpf = document.getElementById('inputCpf')
let email = document.getElementById('inputEmail')
let fone = document.getElementById('inputFone')
let cep = document.getElementById('inputCep')
let logradouro = document.getElementById('inputLogradouro')
let numero = document.getElementById('inputNumero')
let complemento = document.getElementById('inputComplemento')
let bairro = document.getElementById('inputBairro')
let cidade = document.getElementById('inputCidade')
let uf = document.getElementById('inputUf')

// ============================================================
// CRUD - Create ==============================================

// Evento relacionado ao botão submit
frmCadastro.addEventListener('submit', (event) => {
    // Evitar o comportamento padrão (recarregar a página)
    event.preventDefault()
    // IMPORTANTE! Teste de recebimento dos dados do form - Passo 1
    console.log(`Nome: ${nome.value} - 
                 CPF: ${cpf.value} - 
                 E-mail: ${email.value} - 
                 Telefone: ${fone.value} - 
                 CEP: ${cep.value} - 
                 Logradouro: ${logradouro.value} - 
                 Número: ${numero.value} - 
                 Complemento: ${complemento.value} - 
                 Bairro: ${bairro.value} - 
                 Cidade: ${cidade.value} - 
                 UF: ${uf.value} - `)
    // Criar um objeto para enviar ao main os dados da nota
    const cadastroCliente = {
        textNote: nome.value,
        textNote: cpf.value,
        textNote: email.value,
        textNote: fone.value,
        textNote: cep.value,
        textNote: logradouro.value,
        textNote: numero.value,
        textNote: complemento.value,
        textNote: bairro.value,
        textNote: cidade.value,
        textNote: uf.value,
    }
    // Enviar o objeto para o main (Passo 2: fluxo)
    api.createCadastro(cadastroCliente)
})

// == Fim - CRUD - Create =====================================
// ============================================================