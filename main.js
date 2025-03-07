console.log("Electron - Processo principal")

// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme -> definir o tema claro, escuro ou padrão do sistema
// Menu -> definir um menu personalizado
// Shell -> Acessar links externos no navegador padrão
const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron/main')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // Largura
    height: 720, // Altura
    resizable: false, // Maximizar
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
  nativeTheme.themeSource='light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
    width: 450, // Largura
    height: 300, // Altura
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
