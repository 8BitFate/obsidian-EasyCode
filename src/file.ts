import {
  CachedMetadata,
  MarkdownPostProcessorContext as MPPContext,
  TFile,
} from 'obsidian';

import {
  parse,
  stringify,
} from 'yaml';


import EasyCode from 'main';

import {
  CodeBlock,
} from 'codeBlock';

import {
  Data,
  Field,
} from 'field';

export class FileData {

  plugin: EasyCode;
  file: TFile;
  fields: { [key: string]: Field }; // TODO add better data structure
  codeBlocks: { [key: string]: CodeBlock };

  constructor(plugin: EasyCode, file: TFile) {
    this.plugin = plugin;
    this.file = file;
    this.fields = {};
    this.codeBlocks = {};
    this.getFields();
  }

  getFields() {
    const cache = this.plugin.app.metadataCache.getFileCache(this.file) || {};
    const frontmatter = cache?.frontmatter;
    if (frontmatter) {
      Object.entries(frontmatter).map(([name, value]) => {
        this.fields[name] = this.createField(name, value);
      });
    }
    return this.fields;
  }

  createField(name: string, value: Data) {
    const info = (this.plugin.app as any).metadataTypeManager
        .getTypeInfo({key: name});
    const type = info.expected.type;
    return new Field(this, name, value, type);
  }

  newBlock(source: string, el: HTMLElement, context: MPPContext) {
    const codeBlockKey = context.docId;
    const codeBlock = new CodeBlock(source, el, this);
    this.codeBlocks[codeBlockKey] = codeBlock;
    codeBlock.run();
  }

  update(cache: CachedMetadata) {
    const frontmatter = cache?.frontmatter;
    if (frontmatter) {
      Object.entries(frontmatter).map(([key, value]) => {
        const field = this.fields[key];
        if (field) {
          field.update(value);
        } else {
          this.fields[key] = this.createField(key, value);
        }
      });
    }
  }

  async editField(name: string, value: Data, type: string) {
    let data: Data = value;
    if ('number' == type) {
      data = Number(value);
    } else if ('checkbox' == type) {
      data = Boolean(value);
    }
    return this.plugin.app.vault.process(this.file, editor(name, data));
  }

}

function editor(name: string, value: Data) {
  return (content: string) => {
    return content.split(/((?:\n|^)-+\n)/).map((part, ind) =>{
      if (ind == 2) {
        const yaml = parse(part, {uniqueKeys: false});
        yaml[name] = value;
        return stringify(yaml, {falseStr: 'false', trueStr: 'true'})
            .replace(/\n.*$/, '');
      } else {
        return part;
      }
    }).join('');
  };
}
