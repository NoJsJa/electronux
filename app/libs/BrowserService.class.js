const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { isEnvDev, loadView } = require('./utils');
const MessageChannel = require('../web/libs/MessageChannel.class');
const { util } = require('chai');

class BrowserService extends BrowserWindow {
  /**
    * constructor [构造函数]
    * @param  {[String]} name [service name]
    * @param  {[String]} _path [service 执行文件路径]
    * @param  {[Object]} options [创建BrowserWindow可选参数]
    */
  constructor(name, _path, options={}) {
    options.webPreferences = options.webPreferences || {};
    options.webPreferences.nodeIntegration = true;
    options.webPreferences.enableRemoteModule = true;

    super({...options, show: false });

    if (isEnvDev) this.webContents.openDevTools();

    this.serviceReady = false;
    this.exec= _path;
    this.name = name;
    this.listeners = [];
    this.callbacks = [];
    this.fails = [];
    MessageChannel.registry(name, this.id);
    
    /* state change */
    this.webContents.on('did-finish-load', this.didFinishLoad);
    this.webContents.on('did-fail-load', this.didFailLoad);

    /* load contents immediately */
    this.loadURL(this.exec, {
      webSecurity: !!options.webPreferences.webSecurity
    });
  }

  /* state listeners */
  didFinishLoad = () => {
    this.serviceReady = true;
    this.callbacks.forEach(callback => {
      callback(this.id);
    });
  }

  didFailLoad = (error) => {
    this.serviceReady = false;
    this.fails.forEach(handle => {
      handle(error.toString());
    });
  }

  /* function rewriten */

  /* loadURL */
  loadURL(_path, options={}) {
    if (!options.webSecurity) {
      return this.loadURL_SAFE(_path);
    } else {
      return this.loadURL_UNSAFE(_path);
    }
  }

  /* loadURL - safe function with script injection */
  loadURL_SAFE = (_path) => {
    return new Promise((resolve, reject) => {
      fs.readFile(_path, { encoding: 'utf-8' }, (err, buffer) => {
        if (err) {
          reject(err);
          this.didFailLoad(err);
          return console.error(err);
        }
        super.loadURL(
          loadView({
              webSecurity: true,
              script: buffer.toString(),
              title: `${this.name} service`,
              base: url.format({
                  pathname: path.dirname(this.exec),
                  protocol: 'file:',
                  slashes: true
              })
          }),
          {
            baseURLForDataURL: path.dirname(_path)
          }
        ).then(resolve)
        .catch(err => {
          reject(err);
          this.didFailLoad(err);
          console.error(err);
        });
      })
    })
  }

  /* loadURL - unsafe function to external script and options.webSecurity closed */
  loadURL_UNSAFE = (_path) => {
    return super.loadURL(
      loadView({
          webSecurity: false,
          src: this.exec,
          title: `${this.name} service`,
          base: url.format({
              pathname: path.dirname(this.exec),
              protocol: 'file:',
              slashes: true
          })
      }),
      {
        baseURLForDataURL: path.dirname(_path)
      }
    ).catch(err => {
      this.didFailLoad(err);
      console.error(err);
    });
  }


  /**
    * connected [service加载完成后触发回调监听者]
    * @param  {[windowId]} param [desc]
    * @param  {[Function]} callback [回调]
    */
  connected(callback) {
    if ((callback && !(callback instanceof Function))) throw new Error('Param - callback must be function type!');

    if (this.serviceReady) {
      callback && callback(this.id)
      return Promise.resolve(this.id);
    } else {
      callback && this.callbacks.push(callback);
      return new Promise((resolve, reject) => {
        this.callbacks.push(resolve);
        this.fails.push(reject);
      });
    }
  }
}

module.exports = BrowserService;
