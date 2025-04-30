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


// ==========================================================================
// == Manipulação do Enter ==================================================

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

// == Fim - Manipulação do Enter ============================================
// ==========================================================================


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


//===========================================================================
//= CRUD Read ===============================================================

api.setName((args) => {
    console.log("IPC set-name acionado");

    const busca = document.getElementById('buscarCliente').value.trim();
    const nomeCampo = document.getElementById('nomeCliente');
    const cpfCampo = document.getElementById('cpfCliente');
    const foco = document.getElementById('buscarCliente');

    foco.value = ""; // limpa o campo de busca

    // Se o valor digitado for um CPF (apenas números, com 11 dígitos)
    const cpfRegex = /^\d{11}$/;
    if (cpfRegex.test(busca.replace(/\D/g, ''))) {
        cpfCampo.value = busca;
        cpfCampo.focus();
    } else {
        nomeCampo.value = busca;
        nomeCampo.focus();
    }
});

function buscarNome() {
    
    const cliValor = document.getElementById('buscarCliente').value.trim();
    if (cliValor === "") {
        api.validateSearch();
    } else {
        api.searchName(cliValor); // envia nome ou CPF
        api.renderClient((event, client) => {
            const clientData = JSON.parse(client);
            clientData.forEach((c) => {
                nomeCliente.value = c.nome;
                cpfCliente.value = c.cpf;
                emailCliente.value = c.email;
                telefoneCliente.value = c.telefone;
                cep.value = c.cep;
                logradouro.value = c.logradouro;
                numero.value = c.numero;
                complemento.value = c.complemento;
                bairro.value = c.bairro;
                cidade.value = c.cidade;
                uf.value = c.uf;

                restaurarEnter();
                btnCreate.disabled = true;
                btnUpdate.disabled = false;
                btnDelete.disabled = false;
            });
        });
    }
}

//== Fim - CRUD Read ========================================================
//===========================================================================


//===========================================================================
//= CRUD Update =============================================================

function atualizarCliente() {
    const clienteAtualizado = {
        nome: nomeCliente.value,
        cpf: cpfCliente.value,
        email: emailCliente.value,
        telefone: telefone.value,
        cep: cep.value,
        logradouro: logradouro.value,
        numero: numero.value,
        complemento: complemento.value,
        bairro: bairro.value,
        cidade: cidade.value,
        uf: uf.value
    }

    api.updateClient(clienteAtualizado)
}

//= Fim - CRUD Update =======================================================
//===========================================================================


//===========================================================================
//= CRUD Delete =============================================================

function excluirCliente() {
    const cpf = cpfCliente.value

    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        api.deleteClient(cpf)
    }
}

//= Fim - CRUD Delete =======================================================
//===========================================================================
