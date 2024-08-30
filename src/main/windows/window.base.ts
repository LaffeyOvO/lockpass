import { BrowserWindow, screen } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { AppEvent, AppEventType } from '@main/entitys/appmain.entity'
import { MainToWebMsg } from '@common/entitys/ipcmsg.entity'
import { EntityType } from '@common/entitys/app.entity'
import { Log } from '@main/libs/log'
import AppModel from '@main/models/app.model'
export class WindowBase {
  protected witdth: number = 900
  protected height: number = 670
  protected click_outsize_close = false
  protected url: string = 'index.html'
  protected resizeable: boolean = true
  protected closeable: boolean = true
  protected haveFrame: boolean = true //是否无边框
  protected ontop: boolean = false
  protected wintype: string = 'normal'

  private window: BrowserWindow | null = null

  get content() {
    return this.window.webContents
  }

  get win() {
    return this.window
  }

  get isvisible() {
    return this.window.isVisible()
  }

  constructor() {
    AppEvent.on(AppEventType.windowBlur, (windows: BrowserWindow) => {
      this.CheckBlurClick(windows)
    })
    AppEvent.on(AppEventType.LockApp, () => {
      this.lockapp()
      this.win.webContents.send(MainToWebMsg.LockApp)
    })
    AppEvent.on(AppEventType.LoginOk, () => {
      this.win.webContents.send(MainToWebMsg.LoginOK)
    })
    AppEvent.on(AppEventType.Message, (msagetype, msg, duration) => {
      this.win.webContents.send(MainToWebMsg.ShowMsg, msagetype, msg, duration)
    })
    AppEvent.on(AppEventType.VaultChange, () => {
      this.win.webContents.send(MainToWebMsg.VaultChange)
    })
    AppEvent.on(AppEventType.UserChange, () => {
      this.win.webContents.send(MainToWebMsg.UserChange)
    })
    AppEvent.on(AppEventType.VaultItemChange, () => {
      this.win.webContents.send(MainToWebMsg.vaultItemChange)
    })
    AppEvent.on(AppEventType.DataChange, (type: EntityType) => {
      this.win.webContents.send(MainToWebMsg.DataChange, type)
    })
    AppEvent.on(AppEventType.APPQuit, () => {
      if (is.dev) this.win.webContents.closeDevTools()
      this.close()
    })
    AppEvent.on(AppEventType.LoginOut, () => {
      this.lockapp()
      this.win.webContents.send(MainToWebMsg.LoginOut)
    })
  }

  lockapp() {
    return
  }
  initWin() {
    this.window = new BrowserWindow({
      width: this.witdth,
      height: this.height,
      alwaysOnTop: this.ontop,
      type: this.wintype,
      show: false,
      icon,
      resizable: this.resizeable,
      closable: this.closeable,
      frame: this.haveFrame,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    if (is.dev) this.window.webContents.openDevTools({ mode: 'detach' })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${this.url}`)
    } else {
      this.win.loadFile(join(__dirname, `../renderer/${this.url}`))
    }
    this.window.on('close', (event) => {
      if (AppModel.App_quit) return
      event.preventDefault()
      this.hide()
    })
  }

  show() {
    Log.Info('show window', this.url)
    AppModel.getInstance().setLastPoint(screen.getCursorScreenPoint())
    this.win.show()
  }

  hide() {
    Log.Info('hide window', this.url)
    this.window.hide()
    this.window.setSkipTaskbar(true)
  }

  close() {
    Log.Info('close window', this.url)
    this.window.close()
  }

  showOrHide(show: boolean) {
    if (show) this.show()
    else this.hide()
  }

  setSize(width: number, height: number) {
    const oldsize = this.win.getSize()
    if (width <= 0) width = oldsize[0]
    if (height <= 0) height = oldsize[1]
    this.win.setMinimumSize(width, height)
    // const [minWidth, minHeight] = this.win.getMinimumSize()
    // console.log('change size', width, height, this.url, oldsize, minWidth, minHeight)
    this.window.setSize(width, height, true)
  }

  CheckBlurClick(windows: BrowserWindow) {
    if (!this.click_outsize_close || this.window.isVisible() == false) return
    if (this.window != windows) return
    // console.log('checkblurclick', windows, this.window == windows, this.window.isVisible())
    const { x, y } = screen.getCursorScreenPoint()
    const rect = this.win.getBounds()
    if (x < rect.x || x > rect.x + rect.width || y < rect.y || y > rect.y + rect.height) {
      this.hide()
    }
  }
}
