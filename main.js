// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme -> definir o tema claro, escuro ou padrão do sistema
// Menu -> definir um menu personalizado
// Shell -> Acessar links e aplicações externos no navegador padrão
// ipcMain -> Permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// dialog -> Módulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

// Ativação do preload.js (importação do path (caminho))
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')
const { on } = require('node:events')

// Importação do modelo de dados (Notes.js)
const clientesModel = require('./src/models/Clientes.js')

// Importação da biblioteca nativa do JS para manipular arquivos
const fs = require('fs')

// Importação do pacote jspdf (arquivos PDF) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

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
      width: 700, // Largura
      height: 550, // Altura
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
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
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


//===========================================================================
//= Relatório de clientes ===================================================

async function relatorioClientes() {
  try {
    //================================================
    //         Configuração do documento PDF
    //================================================
    // p -> portrait (em pé) / l -> landscape (deitado)
    // mm -> milímetro / a4 -> tamanho da folha - 210 milímetros de largura e 297 milímetros de altura
    const doc = new jsPDF('p', 'mm', 'a4')

    // Inserir data atual no documento
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    // doc.setFontSize() escolhe o tamanho da fonte em pontos (pt), onde 1 ponto equivale a aproximadamente 0,35 mm (igual no Word) 
    doc.setFontSize(10)
    // doc.text() escreve um texto no documento
    doc.text(`Data: ${dataAtual}`, 150, 10) // (x, y (mm)) - 150 mm para direita e 50 mm para baixo

    // Inserir título no documento
    doc.setFontSize(18)
    doc.text("Relatório de clientes", 15, 30)

    //================================================
    // Cabeçalho do documento
    //================================================
    doc.setFontSize(12)
    let y = 50 // Variável de apoio
    doc.text("Nome", 14, y)
    doc.text("Telefone", 85, y)
    doc.text("E-mail", 130, y)
    y += 5 // += atribui valor ao "y"

    // Desenhar uma linha
    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y) // (10 (início) __________ 200 (fim))
    y += 10

    //================================================
    // Obter a listagem de clientes (ordem alfabética)
    //================================================

    const clientes = await clientesModel.find().sort({ nome: 1 })
    // Teste de recebimento (IMPORTANTE!)
    // console.log(clientes)
    // Popular o documento PDF com os clientes cadastrados
    clientes.forEach((c) => {
      // Criar uma nova página se y > 280mm (A4 = 297 mm)
      if (y > 280) {
        doc.addPage()
        y = 20 // Margem de 20mm para iniciar a nova folha

        // Cabeçalho do documento
        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        doc.text("E-mail", 130, y)
        y += 5 // += atribui valor ao "y"

        // Desenhar uma linha
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y) // (10 (início) __________ 200 (fim))
        y += 10
      }
      doc.text(String(c.nome || ''), 14, y)
      doc.text(String(c.telefone || ''), 85, y)
      doc.text(String(c.email || ''), 130, y)
      y += 15
    })

    //================================================
    //       Numeração automática de páginas
    //================================================

    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página: ${i} de ${pages}`, 105, 290, { align: 'center' }) // A VER O ALIGN: 'CENTER'
    }

    //================================================
    //  Abrir o arquivo PDF no sistema operacional
    //================================================
    // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (IMPORTANTE!)
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    // Salvar temporariamente o arquivo
    doc.save(filePath)
    // Abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

//= Fim - Relatório de clientes =============================================
//===========================================================================


//===========================================================================
//= CRUD Create =============================================================

// Recebimento do objeto que contem os dados da nota
ipcMain.on('create-clientes', async (event, cadastroClientes) => {
  //IMPORTANTE! Teste do reecebimento do objeto (Passo 2)
  console.log(cadastroClientes)
  //Criar uma nova estrutura de dados para salvar no banco
  //Atençaõ!! os atributos da estrutura precisam se idênticos ao modelo e os valores são obtidos através do objeto

  try {
    const newClientes = clientesModel({
      nome: cadastroClientes.nome,
      cpf: cadastroClientes.cpf,
      email: cadastroClientes.email,
      telefone: cadastroClientes.telefone,
      cep: cadastroClientes.cep,
      logradouro: cadastroClientes.logradouro,
      numero: cadastroClientes.numero,
      complemento: cadastroClientes.complemento,
      bairro: cadastroClientes.bairro,
      cidade: cadastroClientes.cidade,
      uf: cadastroClientes.uf

    })
    //Salvar os dados do cliente no banco de dados (Passo 3:fluxo)
    await newClientes.save()


    //confirmação de cliente adicionado ao banco (uso do dialog)
    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      // se o botão OK for pressionando
      if (result.response === 0) {
        //enviar um pedido para o renderizador limpar os campos (preload.js)
        event.reply('reset-form')
      }
    })

  } catch (error) {
    // Tratamento da exceção de CPF duplicado
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "ATENÇÃO!",
        message: "CPF já cadastrado. \n Verfique o número digitado.",
        buttons: ['OK']
      }).then((result) => {
        // Se o botão OK for pressionado
        if (result.response === 0) {
          event.reply('reset-cpf')
        }
      })
    } else {
      console.log(error)
    }
  }

})


//== Fim - CRUD Create ======================================================
//===========================================================================


//===========================================================================
//= CRUD Read ===============================================================

ipcMain.on('search-name', async (event, cliValor) => {
  console.log("Valor de busca recebido:", cliValor)

  try {
    const valor = cliValor.trim()
    const cpfRegex = /^\d{11}$/ // verifica se é CPF

    // Se for CPF, busca pelo campo 'cpf'; senão, pelo campo 'nome'
    const query = cpfRegex.test(valor.replace(/\D/g, ''))
      ? { cpf: new RegExp(valor, 'i') }
      : { nome: new RegExp(valor, 'i') }

    const client = await clientesModel.find(query)

    if (client.length === 0) {
      dialog.showMessageBox({
        type: 'warning',
        title: 'Aviso',
        message: 'Cliente não cadastrado. \nDeseja cadastrar este cliente?',
        defaultId: 0,
        buttons: ['Sim', 'Não']
      }).then((result) => {
        if (result.response === 0) {
          event.reply('set-name')
        } else {
          event.reply('reset-form')
        }
      });
    } else {
      event.reply('render-client', JSON.stringify(client))
    }
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
  }
});

//== Fim - CRUD Read ========================================================
//===========================================================================


//===========================================================================
//= CRUD Update =============================================================

// Atualizar cliente no banco
ipcMain.on('update-clientes', async (event, dadosAtualizados) => {
  try {
    // Procurar o cliente pelo CPF (ou algum outro identificador único)
    const cliente = await clientesModel.findOne({ cpf: dadosAtualizados.cpf })
    if (!cliente) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Erro',
        message: 'O CPF não pode ser alterado! Para corrigir esse dado, exclua o cliente e cadastre novamente.',
        buttons: ['OK']
      })
      return
    }

    // Atualizar os dados do cliente
    cliente.nome = dadosAtualizados.nome
    cliente.email = dadosAtualizados.email
    cliente.telefone = dadosAtualizados.telefone
    cliente.cep = dadosAtualizados.cep
    cliente.logradouro = dadosAtualizados.logradouro
    cliente.numero = dadosAtualizados.numero
    cliente.complemento = dadosAtualizados.complemento
    cliente.bairro = dadosAtualizados.bairro
    cliente.cidade = dadosAtualizados.cidade
    cliente.uf = dadosAtualizados.uf

    // Salvar no banco de dados
    await cliente.save()

    // Confirmação de sucesso
    dialog.showMessageBox({
      type: 'info',
      title: 'Sucesso',
      message: 'Cliente atualizado com sucesso!',
      buttons: ['OK']
    })

    // Enviar uma mensagem para o renderer para resetar o formulário
    event.reply('reset-form')

  } catch (error) {
    console.log(error)
    dialog.showMessageBox({
      type: 'error',
      title: 'Erro',
      message: 'Ocorreu um erro ao atualizar o cliente.',
      buttons: ['OK']
    })
  }
})

//= Fim - CRUD Update =======================================================
//===========================================================================


//===========================================================================
//= CRUD Delete =============================================================

ipcMain.on('delete-client', async (event, cpf) => {
  try {
    const resultado = await clientesModel.deleteOne({ cpf: cpf })
    if (resultado.deletedCount > 0) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Exclusão concluída',
        message: 'Cliente excluído com sucesso!'
      })
      // Limpar formulário após exclusão
      event.reply('reset-form')
    } else {
      dialog.showMessageBox({
        type: 'warning',
        title: 'Erro',
        message: 'Cliente não encontrado para exclusão.'
      })
    }
  } catch (erro) {
    console.log(erro)
    dialog.showErrorBox('Erro ao excluir cliente', erro.message)
  }
})

//= Fim - CRUD Delete =======================================================
//===========================================================================
