import {
  CachedMetadata,
  TFile,
} from 'obsidian';

import EasyCode from 'main';
import {
  CodeBlock,
} from 'code-handler';
import {
  arrayEquals,
} from 'utils';

export type Data = string | number | boolean | Data[] | null

export function dataToString(value: Data) {
  return value?.toString() || '';
}

export class FileHandler {
  plugin: EasyCode;
  file: TFile;
  fields: {[key: string]: Field}; // TODO add better data structure
  codeBlocks: {[key: string]: CodeBlock};

  constructor(plugin: EasyCode, file: TFile) {
    this.plugin = plugin;
    this.file = file;
    this.fields = {};
    this.codeBlocks = {};
  }

  getFields() {
    const cache = this.plugin.app.metadataCache.getFileCache(this.file);
    const frontmatter = cache?.frontmatter;
    if (frontmatter) {
      this.fields = Object.entries(frontmatter).reduce((acc, [key, value]) => {
        const field = new Field(this, key, value);
        return Object.assign(acc, {[key]: field});
      }, {});
      return this.fields;
    }
    return {};
  }

  update(cache: CachedMetadata) {
    const frontmatter = cache?.frontmatter;
    if (frontmatter) {
      Object.entries(frontmatter).map(( [key, value] ) => {
        const field = this.fields[key];
        if (field) {
          if ( Array.isArray(field.value) && Array.isArray(value)) {
            if (!arrayEquals(field.value, value)) {
              field.update(value);
            }
          } else if (field.value != value) {
            field.update(value);
          }
        } else {
          this.fields[key] = new Field(this, key, value);
        }
      });
    }
  }
}

export class Field {
  parentFile: FileHandler;
  name: string;
  value: Data;
  updaters: ((value: Data) => void)[];

  constructor(parentFile: FileHandler, name: string, value: Data = null) {
    this.parentFile = parentFile;
    this.name = name;
    this.value = value;
    this.updaters = [];
  }

  getValue() {
    return dataToString(this.value);
  }

  update(value: Data) {
    this.value = value;
    this.updaters.map((x) => x(value));
  }

  fixed(el: HTMLElement) {
    return el.createEl('span', {text: this.getValue()});
  }

  dynamic(el: HTMLElement) {
    const container = el.createEl('div', {text: this.getValue()});
    const updater = (value: Data) => {
      container.innerHTML = dataToString(value);
    };
    this.updaters.push(updater);
    return container;
  }

  editable() {
    // TODO
  }
}

