import {App,
  CachedMetadata,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default',
};
// class frontmatter {
//   fields: [Field];
//   constructor(fields: [Field]) {
//     this.fields = fields;
//   }
// }

class Field {
  file: TFile;
  name: string;
  value; // string | number | boolean;
  el: HTMLElement;
  cbs: [TFile, string, (d: any) => Promise<void>][];
  constructor(
      file: TFile,
      name: string,
      value: any,
      el: HTMLElement,
      cbs: [TFile, string, (d: any) => Promise<void>][] ) {
    this.name = name;
    this.file = file;
    this.value = value;
    this.el = el;
    this.cbs = cbs;
  }
  constant(el: HTMLElement = this.el) {
    return el.createEl('div', {text: this.value.toString()});
  }
  updateing(el: HTMLElement = this.el) {
    const disp = el.createEl('div', {text: this.value.toString()});
    console.log(this.value);
    const cb = async (d: any) =>{
      disp.innerHTML = d.toString();
    };
    this.cbs.push([this.file, this.name, cb]);
    return disp;
  }
}
export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  cbs: [TFile, string, (d: any) => Promise<void>][] = [];

  update_callbacks : [[
    path: string,
    name: string,
    cb: (s: string) => Promise<void>]];

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SampleSettingTab(this.app, this));
    this.registerEvent(
        this.app.metadataCache.on(
            'changed',
            function(cbs: [TFile, string, (d: any) => Promise<void>][]) {
              return function(f: TFile, d: string, m: CachedMetadata) {
              // console.log(f);
              // console.log(d);
              // console.log(m);
                cbs.forEach((x) => {
                  if (f == x[0]) {
                    if (m?.frontmatter) {
                      x[2](m.frontmatter[x[1]]);
                    }
                  }
                });
              };
            }(this.cbs)
            , {}));

    const processor = function(
        cbs: [TFile, string, (d: any) => Promise<void>][]) {
      return async function(
          source: string,
          el: HTMLElement,
          _ctx: MarkdownPostProcessorContext) {
        el.innerHTML = '';
        try {
          const file = app.workspace.getActiveFile();
          console.log('this is it:' + file);
          let fields: Field[] = [];
          if (file) {
            const fm = app.metadataCache.getFileCache(file);
            if (fm?.frontmatter) {
              fields = Object.entries(
                  fm.frontmatter.valueOf() )
                  .map(([name, data]) => {
                    return new Field(file, name, data, el, cbs);
                  });
            }
          }
          const result = await new Function(
              'fm',
              source + '\nreturn fmf_config;')(fields);
          console.log(result);
        } catch (e) {
          el.innerHTML = '';
          el.innerHTML = 'Evaluation Error: ' + e.stack;
        }
      };
    };
    this.registerMarkdownCodeBlockProcessor('fmfjs', processor(this.cbs));
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
        .setName('Setting')
        .setDesc('It\'s a secret')
        .addText((text) => text
            .setPlaceholder('Enter your secret')
            .setValue(this.plugin.settings.mySetting)
            .onChange(async (value) => {
              this.plugin.settings.mySetting = value;
              await this.plugin.saveSettings();
            }));
  }
}
