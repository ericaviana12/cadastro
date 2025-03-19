console.log("Electron - Processo principal")

// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme -> definir o tema claro, escuro ou padrão do sistema
// Menu -> definir um menu personalizado
// Shell -> Acessar links externos no navegador padrão
// ipcMain -> Permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain } = require('electron/main')

// Ativação do preload.js (importação do path (caminho))
const path = require('node:path')

// Importação ds métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // Largura
    height: 720, // Altura
    resizable: false, // Maximizar

      // Linhas abaixo para ativação do preload. Importado através da linha de Importação ds métodos conectar e desconectar (módulo de conexão)
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
  })

  // Carregar o menu personalizado
  // Atenção! Antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))


// Carregar o documento HTML na janela
win.loadFile('./src/views/index.html')
}

// Janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 500, // Largura
      height: 500, // Altura
      autoHideMenuBar: true, // Esconder o menu do browser
      resizable: false, // Maximizar
      minimizable: false, // Minimizar
      parent: mainWindow, // Estabelecer uma relação hierárquica entre janelas
      modal: true // Criar uma janela modal
    })
  }

  about.loadFile('./src/views/sobre.html')
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()

  // Melhor local para estebelecer a conexão com o banco de dados
  // No MongoDb é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e fechar a conexão e encerrar quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    // A linha abaixo estabelece a conexão com o banco de dados
    await conectar()
    // Enviar ao rendereizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5s ou 1s para sincronização com a nuvem)
    setTimeout(() => {
      // Enviar ao renderizador a mensagem "conectado"
      // db-status (IPC - comunicação entre processos - autorizada pelo preload.js)
      event.reply('db-status', "conectado")
    }, 500) // 500ms = 0.5s
  })

  // Só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Se o sistema não for MAC, encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar()
})

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
// Abertura e fechamento em [] é para a criação de um vetor
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Relatório',
    submenu: [
      {
        label: 'Clientes',
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir zoom',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/ericaviana12/cadastro')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]
