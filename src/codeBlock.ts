import {
  FileData,
} from 'file';

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

const CODE_POSTFIX = `
return typeof variable !== 'undefined' ? ec_settings : {};
`;

export class CodeBlock {

  source: string;
  wrapper: HTMLElement;
  container: HTMLElement;
  parentFile: FileData;
  settings: CodeBlockSettings;

  constructor(
      source: string,
      wrapper: HTMLElement,
      parentFile: FileData,
      settings: DeepPartial<CodeBlockSettings> = {}
  ) {
    this.source = source;
    this.wrapper = wrapper;
    this.container = wrapper.createEl('div');
    this.parentFile = parentFile;
    this.settings = patch(DEFAULT_CODE_BLOCK_SETTINGS, settings);
  }

  run() {
    this.container.innerHTML = '';
    const code = this.source + CODE_POSTFIX;
    const executable = new Function('fm', 'el', code);
    try {
      const codeSettings = executable(this.parentFile.fields, this.container);
      this.settings = patch(this.settings, codeSettings );
    } catch (err) {
      // this.container.innerHTML = '';
      this.container.innerHTML = 'Evaluation Error: ' + err.stack;
    }
  }

}
