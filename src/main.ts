import {
  CachedMetadata,
  MarkdownPostProcessorContext,
  Plugin,
  TFile,
} from 'obsidian';

import {
  EasyCodeSettings,
  EasyCodeTab,
  defaultSettings,
} from 'settings';

import {
  FileData,
} from 'file';


import {
  waitForActiveFile,
} from 'utils';

export default class EasyCode extends Plugin {

  settings: EasyCodeSettings;

  activeFiles: {[key :string]: FileData} = {};

  types: {[key: string]: string} = {};

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new EasyCodeTab(this.app, this));


    this.loadTypes();
    this.registerEvent(
        this.app.metadataTypeManager.on(
            'changed',
            (name: string) => {
              this.types[name] = this.app.metadataTypeManager.types[name] .type;
              console.log(this.types);
            })
    );

    this.activeFiles = {};
    this.registerMarkdownCodeBlockProcessor(
        this.settings.keyword,
        codeProcessor(this)
    );

    this.registerEvent(
        this.app.metadataCache.on( 'changed', cacheHandler(this)));

    // const statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText('Status Bar Text');

    this.addCommand({
      id: 'easycode-refresh-bloks',
      name: 'EasyCode refresh all blocks',
      callback: () => {
        this.refreshCodeBlocks();
      },
    });
  }

  refreshCodeBlocks() {
    Object.values(this.activeFiles).map((file) => {
      file.getFields();
      Object.values(file.codeBlocks).map((codeBlock) => {
        codeBlock.run();
      });
    });
  }

  onunload() {

  }

  loadTypes() {
    Object.entries(
        this.app.metadataTypeManager.types
    ).map(([name, {type}]: [string, {type: string}]) => {
      this.types[name] = type;
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, defaultSettings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

}

function codeProcessor(plugin: EasyCode) {
  return async (
      source: string,
      el: HTMLElement,
      context: MarkdownPostProcessorContext
  ) => {
    const file = await waitForActiveFile(plugin, context.sourcePath);
    let fileHandler = plugin.activeFiles[file.path];
    if (!fileHandler) {
      fileHandler = new FileData(plugin, file);
      plugin.activeFiles[file.path] = fileHandler;
    }
    fileHandler.newBlock(source, el, context);
  };
}

function cacheHandler(plugin: EasyCode) {
  return (file: TFile, _data: string, cache: CachedMetadata) => {
    const fileHandler = plugin.activeFiles[file.path];
    if (fileHandler) {
      fileHandler.update(cache);
    }
  };
}

