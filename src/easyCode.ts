import {
  TFile,
} from 'obsidian';


import EasyCode from 'main';

import {
  FileData,
} from 'file';

export class EasyCodeApi {

  plugin: EasyCode;

  constructor(plugin: EasyCode) {
    this.plugin = plugin;
  }

  getFile(pathOrFile: TFile | string) {
    let file: TFile;
    if (typeof pathOrFile === 'string') {
      const abs = this.plugin.app.vault.getAbstractFileByPath(pathOrFile);
      if (abs instanceof TFile) {
        file = abs;
      } else {
        throw Error('Invalid file path');
      }
    } else {
      file = pathOrFile;
    }
    return file;
  }

  getFrontmatter(pathOrFile: TFile | string) {
    return new FileData(this.plugin, this.getFile(pathOrFile));
  }

}
