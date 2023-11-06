import {
  MarkdownPostProcessorContext,
} from 'obsidian';

import EasyCode from 'main';

import {
  FileHandler,
} from 'frontmatter';

import {
  DeepPartial,
  patch,
} from 'utils';

type CodeBlockSettings = {
  test: string;
}

const DEFAULT_CODE_BLOCK_SETTINGS: CodeBlockSettings = {
  test: 'test',
};

export class CodeBlock {
  plugin: EasyCode;
  source: string;
  wrapper: HTMLElement;
  container: HTMLElement;
  context: MarkdownPostProcessorContext;
  parentFile: FileHandler;
  settings: CodeBlockSettings;

  constructor(
      plugin: EasyCode,
      source: string,
      wrapper: HTMLElement,
      context: MarkdownPostProcessorContext,
      parentFile: FileHandler,
      settings: DeepPartial<CodeBlockSettings> = {}
  ) {
    this.plugin = plugin;
    this.source = source;
    this.wrapper = wrapper;
    this.container = wrapper.createEl('div');
    this.context = context;
    this.parentFile = parentFile;
    this.settings = patch(DEFAULT_CODE_BLOCK_SETTINGS, settings);
  }

  run() {
    const code = new Function(
        'fm', 'el', 'ctx',
        this.source + '\nreturn fmf_config || {};');
    try {
      const codeSettings = code(
          this.parentFile.fields,
          this.container,
          this.context);
      this.settings = patch(this.settings, codeSettings );
    } catch (err) {
      this.container.innerHTML = '';
      this.container.innerHTML = 'Evaluation Error: ' + err.stack;
    }
  }
}
