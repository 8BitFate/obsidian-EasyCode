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
  CodeBlock,
} from 'code-handler';

import {
  FileHandler,
} from 'frontmatter';
import {
  waitForActiveFile,
} from 'utils';

export default class EasyCode extends Plugin {
  settings: EasyCodeSettings;

  activeFiles: {[key: string]: FileHandler} = {};

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new EasyCodeTab(this.app, this));

    this.activeFiles = {};
    this.registerMarkdownCodeBlockProcessor(
        this.settings.keyword,
        codeProcessor(this));

    this.registerEvent(
        this.app.metadataCache.on( 'changed', cacheHandler(this))
    );


    // const statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText('Status Bar Text');

    this.addCommand({
      id: 'easycode-refresh-bloks',
      name: 'EasyCode refresh all blocks',
      callback: () => {
        // TODO
      },
    });
  }

  resetCodeBlocks() { // TODO
    return;
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, defaultSettings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

function codeProcessor(plugin: EasyCode) {
  return async ( source: string,
      el: HTMLElement,
      context: MarkdownPostProcessorContext
  ) => {
    const file = await waitForActiveFile(plugin);
    let fileHandler = plugin.activeFiles[file.path];
    if (!fileHandler) {
      fileHandler = new FileHandler(plugin, file);
      fileHandler.getFields();
      plugin.activeFiles[file.path] = fileHandler;
    }
    const codeBlockKey = context.docId;
    const codeBlock = new CodeBlock(plugin, source, el, context, fileHandler);
    fileHandler.codeBlocks[codeBlockKey] = codeBlock;
    codeBlock.run();
  };
}

function cacheHandler(plugin: EasyCode) {
  return (file: TFile, data: string, cache: CachedMetadata) => {
    const fileHandler = plugin.activeFiles[file.path];
    if (fileHandler) {
      fileHandler.update(cache);
    }
  };
}
