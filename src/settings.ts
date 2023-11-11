import {
  App,
  PluginSettingTab,
  Setting,
} from 'obsidian';
import EasyCode from 'main';

export interface EasyCodeSettings {
  keyword: string,
  startupWaitRetrys: number,
  startupWaitDelay: number,
}

export const defaultSettings: EasyCodeSettings = {
  keyword: 'ecjs',
  startupWaitRetrys: 10,
  startupWaitDelay: 1000,
};

export class EasyCodeTab extends PluginSettingTab {

  plugin: EasyCode;

  constructor(app: App, plugin: EasyCode) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
        .setName('Code block keyword')
        .setDesc('Code blocks with this as the language will be executed.')
        .addText((text) => text
            .setPlaceholder('ecjs')
            .setValue(this.plugin.settings.keyword)
            .onChange(async (value) => {
              this.plugin.settings.keyword = value;
              await this.plugin.saveSettings();
              this.plugin.refreshCodeBlocks();
            }));
  }

}
