function buscarEndereco() {
    let cep = document.getElementById('cep').value
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`

    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            document.getElementById('logradouro').value = dados.logradouro
            document.getElementById('bairro').value = dados.bairro
            document.getElementById('cidade').value = dados.localidade
            document.getElementById('uf').value = dados.uf;
        })
        .catch(error => console.error('Erro ao buscar o endereço:', error));
}

function mascaraTelefone(input) {
    // Remove tudo o que não for número
    let valor = input.value.replace(/\D/g, '');

    // Aplica a máscara (DDD)XXXXX-XXXX
    if (valor.length <= 2) {
        input.value = `(${valor}`;
    } else if (valor.length <= 6) {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else {
        input.value = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`;
    }
}

function preencherUF(uf) {
    const selectUF = document.getElementById('uf');
    selectUF.value = uf;  // Aqui você passa a UF que deseja preencher
}

// Exemplo de preenchimento automático, com uma UF específica
window.onload = function () {
    // Preenchendo a UF automaticamente (exemplo: 'SP' para São Paulo)
    preencherUF('SP');
}

function validarCPF(input) {
    var cpf = input.value.replace(/\D/g, ''); // Remove tudo o que não é número

    // Verifica se o CPF tem 11 dígitos e se não é uma sequência de números iguais (ex: 11111111111)
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        input.setCustomValidity("CPF inválido!"); // Mensagem para CPF inválido
        return false;
    }

    // Calcula o primeiro dígito verificador
    var soma = 0;
    var peso = 10;
    for (var i = 0; i < 9; i++) {
        soma += cpf[i] * peso;
        peso--;
    }
    var resto = soma % 11;
    var primeiroDigito = (resto < 2) ? 0 : 11 - resto;
    
    // Calcula o segundo dígito verificador
    soma = 0;
    peso = 11;
    for (var i = 0; i < 10; i++) {
        soma += cpf[i] * peso;
        peso--;
    }
    resto = soma % 11;
    var segundoDigito = (resto < 2) ? 0 : 11 - resto;

    // Verifica se os dois dígitos verificadores calculados são iguais aos informados
    if (cpf[9] == primeiroDigito && cpf[10] == segundoDigito) {
        input.setCustomValidity(""); // Remove a mensagem de erro
        return true;
    } else {
        input.setCustomValidity("CPF inválido!"); // Mensagem para CPF inválido
        return false;
    }
}

document.querySelector("form").addEventListener("submit", function (event) {
    let nome = document.getElementById("cnome").value.trim();
    let email = document.getElementById("cemail").value.trim();
    let telefone = document.getElementById("cphone").value.trim();
    let cpf = document.getElementById("cpf").value.trim();
    let cep = document.getElementById("cep").value.trim();

    if (!nome || !email || !telefone || !cpf || !cep) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        event.preventDefault();
    }
});

//document.getElementById('btnAdicionar').addEventListener('click', function () {
    // Função para adicionar os dados
//    alert('Dados adicionados com sucesso!');
    // Aqui você pode adicionar a lógica de cadastro no banco de dados ou na memória
//});

//document.getElementById('btnEditar').addEventListener('click', function () {
    // Função para editar os dados
//    alert('Dados editados com sucesso!');
    // Aqui você pode adicionar a lógica de edição no banco de dados ou na memória
//});

//document.getElementById('btnExcluir').addEventListener('click', function () {
    // Função para excluir os dados
//    alert('Dados excluídos com sucesso!');
    // Aqui você pode adicionar a lógica de exclusão no banco de dados ou na memória
//});