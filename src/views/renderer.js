/**
 * Processo de renderização do documento index.html
 */

console.log("Processo de Renderização")

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
const foco = document.getElementById('buscarCliente')

// Criar um vetor global para extrair os dados do cliente
let arrayClient = []

// Iniciar a janela de clientes alterando as propriedades de alguns elementos
// Alterar as propriedades do documento HTML ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botões "atualizar" e "excluir"
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Ativar o botão "adicionar"
    btnCreate.disabled = false
    //Iniciar o documento com foco na caixa de texto
    foco.focus()
})

// Capturar os dados do formulário (Passo 1: fluxo)
let frmCli = document.getElementById('frmCli')
let nomeCliente = document.getElementById('nomeCliente')
let cpfCliente = document.getElementById('cpfCliente')
let emailCliente = document.getElementById('emailCliente')
let telefoneCliente = document.getElementById('telefoneCliente')
let cep = document.getElementById('cep')
let logradouro = document.getElementById('logradouro')
let numero = document.getElementById('numero')
let complemento = document.getElementById('complemento')
let bairro = document.getElementById('bairro')
let cidade = document.getElementById('cidade')
let uf = document.getElementById('uf')


// ============================================================
// == Manipulação do Enter ====================================

function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault() // ignorar o comportamento padrão
        // executar o método de busca do cliente
        buscarNome()
    }
}

// "Escuta" do teclado ('keydown' = pressionar tecla)
frmCli.addEventListener('keydown', teclaEnter)

// função para restaurar o padrão (tecla Enter)
function restaurarEnter() {
    frmCli.removeEventListener('keydown', teclaEnter)
}

// == Fim - Manipulação do Enter ==============================
// ============================================================


//===========================================================================
//= CRUD Create==============================================================

// Evento relacionado ao botão submit
frmCli.addEventListener('submit', (event) => {
    // Evitar o comportamento padrão (recarregar a página) 
    event.preventDefault()

    console.log(
        nomeCliente.value, cpfCliente.value, emailCliente.value, telefoneCliente.value,
        cep.value, logradouro.value, numero.value, complemento.value, bairro.value, cidade.value, uf.value
    )

    const cadastroClientes = {
        nome: nomeCliente.value,
        cpf: cpfCliente.value,
        email: emailCliente.value,
        telefone: telefoneCliente.value,
        cep: cep.value,
        logradouro: logradouro.value,
        numero: numero.value,
        complemento: complemento.value,
        bairro: bairro.value,
        cidade: cidade.value,
        uf: uf.value

    }

    console.log("Enviando para o banco: ", cadastroClientes) // Teste
    //Enviar o objeto para o main (Passo 2: fluxo)
    api.createClientes(cadastroClientes)
})

//== Fim - CRUD Create ======================================================
//===========================================================================


// ==========================================================================
// == Resetar o formulário ==================================================

function resetForm() {
    // Recarregar a página
    location.reload()
}

// Uso da API reserForm quando salvar, editar ou excluir um cliente
api.resetForm((args) => {
    resetForm()
})

// == Fim - Resetar o formulário ============================================
// ==========================================================================


// ==========================================================================
// == Tratamento de exceção CPF duplicado ===================================

// Enviar a mensagem de reset-cpf para o main.js
window.electron.onReceiveMessage('reset-cpf', () => {
    cpfCliente.value = ""        // Limpar o campo CPF
    cpfCliente.focus()           // Focar no campo CPF
    cpfCliente.style.border = '2px solid red' // Adicionar borda vermelha ao campo CPF
})

// == Tratamento de exceção CPF duplicado ===================================
// ==========================================================================


//===========================================================================
//= CRUD Read ===============================================================

// Setar o nome do cliente para fazer um novo cadastro se a busca retornar que o cliente não está cadastrado.
api.setName((args) => {
    console.log("Teste do IPC 'set-name'")
    // "Recortar" o nome da busca e setar (deixar) no campo nome do formulário
    let busca = document.getElementById('buscarCliente').value
    // Limpar o campo de busca (foco foi capturado de forma global)
    foco.value=""
    // Foco no campo nome
    nomeCliente.focus()
    // Copiar o nome do cliente para o campo nome
    nomeCliente.value = busca
})

function buscarNome() { // Nome da função é o nome do onclick no buscarCliente
    console.log("Teste do botão buscar")
    // Capturar o nome a ser pesquisado -> Passo 1
    let cliName = document.getElementById('buscarCliente').value
    // console.log(cliName) // Teste do passo 1
    // Validação de campo obrigatório
    // Se o campo de busca não foi preenchido
    if (cliName === "") {
        // Enviar ao main.js um pedido para alertar o usuário
        // Precisa usar o preload.js
        api.validateSearch()
    } else {
        // Enviar o nome do cliente ao main -> Passo 2 (sair da aplicação e aparecer o nome no terminal)
        api.searchName(cliName)
        // Receber os dados do cliente -> Passo 5
        api.renderClient((event, client) => {
            // Teste de recebimento dos dados do cliente -> Passo 5
            console.log(client)
            // Passo 6 - renderização dos dados do cliente (preencher os inputs do form) | Não esquecer de converter os dados de string para JSON
            const clientData = JSON.parse(client)
            arrayClient = clientData
            // Uso do forEach para percorrer o vetor e extrair os dados
            arrayClient.forEach((c) => {
                nomeCliente.value = c.nome
                cpfCliente.value = c.cpf
                emailCliente.value = c.email
                telefoneCliente.value = c.telefone
                cep.value = c.cep
                logradouro.value = c.logradouro
                numero.value = c.numero
                complemento.value = c.complemento
                bairro.value = c.bairro
                cidade.value = c.cidade
                uf.value = c.uf
                // Restaurar a tecla Enter
                restaurarEnter()
                // Desativar o botão "adicionar"
                btnCreate.disabled = true
                // Ativar os botões "atualizar" e "excluir"
                btnUpdate.disabled = false
                btnDelete.disabled = false
            })
        })
    }

}

//== Fim - CRUD Read ========================================================
//===========================================================================

