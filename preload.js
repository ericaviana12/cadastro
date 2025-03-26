/**
 * preload.js -> Usado no framework electron para aumentar a segurança e o desempenho
 */

// Importação dos recursos do framework electron
// ipcRenderer permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// contextBridge: permissões de comunicação entre processos usando a API do electron
const {ipcRenderer, contextBridge} = require('electron')

// Enviar uma mensagem para o main.js e estabelecer uma conexão com o banco de dados quando iniciar a aplicação
// send (enviar)
//db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')

// Permissões para estabelecer a comunicação entre processos
contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message), // Trocar o ícone de banco de dados conectado ou desconectado
    createCadastro: (cadastroCliente) => ipcRenderer.send('create-cadastro', cadastroCliente) // Envia para o main um objeto - manda a estrutura de dados para ser gravada no banco de dados
})
