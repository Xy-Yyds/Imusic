const {app , BrowserWindow , Tray , Menu , nativeImage, ipcMain} = require('electron')

//启用热加载
const reloader = require('electron-reloader')
reloader(module)

app.on('ready',() => {
    
    // 创建主窗口
    const MainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        icon: "src/static/image/icon.png",
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    // 主窗口内渲染首页
    MainWindow.loadFile('./src/view/main.html')

    // 打开调试工具
    MainWindow.webContents.openDevTools()

    // 创建系统托盘
    let trayicon = nativeImage.createFromPath('src/static/image/trayicon.png')
    let tray = new Tray(trayicon)

    let traymenu = Menu.buildFromTemplate([
        {
            label: "显示界面",
            click: function(){
                MainWindow.show()
            }
        },{
            label: "最小化到系统托盘",
            click: function(){
                MainWindow.hide()
            }
        },{
            label: "退出imusic",
            click: function(){
                app.quit()
            }
        }
    ])

    tray.setContextMenu(traymenu)

    // 监听渲染进程传来的最小化和关闭
    ipcMain.on('window-mini' , function(){
        MainWindow.minimize()
    })
    
    ipcMain.on('window-close' , function(){
       MainWindow.close()
    })
})
