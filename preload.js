/**
 * preload.js -> Usado no framework electron para aumentar a segurança e o desempenho
 */

// Importação dos recursos do framework electron
// ipcRenderer permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// contextBridge: permissões de comunicação entre processos usando a API do electron
const { contextBridge, ipcRenderer } = require('electron')

// Enviar uma mensagem para o main.js e estabelecer uma conexão com o banco de dados quando iniciar a aplicação
// send (enviar)
//db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')

// Permissões para estabelecer a comunicação entre processos
contextBridge.exposeInMainWorld('api', {
  dbStatus: (message) => ipcRenderer.on('db-status', message), // Trocar o ícone de banco de dados conectado ou desconectado
  createClientes: (cadastroClientes) => ipcRenderer.send('create-clientes', cadastroClientes), // Envia para o main um objeto - manda a estrutura de dados para ser gravada no banco de dados
  resetForm: (args) => ipcRenderer.on('reset-form', args), // Quando quer enviar um argumento vazio, utiliza o "args" na função selecionada, como nessa linha de código
  searchName: (cliName) => ipcRenderer.send('search-name', cliName), // Autoriza o ipcRenderer a enviar o nome do cliente
  renderClient: (client) => ipcRenderer.on('render-client', client), // Função onde o ipcRenderer vai receber os dados do cliente do main.js
  validateSearch: () => ipcRenderer.send('validate-search'), // Validação do campo obrigatório de busca
  setName: (args) => ipcRenderer.on('set-name', args), // Trocar o nome do campo de busca e colocar no campo nome, caso não tenha esse cliente no cadastro
  updateClientes: (dadosAtualizados) => ipcRenderer.send('update-clientes', dadosAtualizados),
  deleteClient: (cpf) => ipcRenderer.send('delete-client', cpf)
})

// Tratamento de exceção CPF duplicado
contextBridge.exposeInMainWorld('electron', {
  sendMessage: (channel, data) => { ipcRenderer.send(channel, data) },
  onReceiveMessage: (channel, callback) => { ipcRenderer.on(channel, callback) }
})