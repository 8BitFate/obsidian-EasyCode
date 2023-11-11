import {
  FileData,
} from 'file';

export type Data = string | number | boolean | string[] | null;

const inputTypes: {[key: string]: string} = {
  aliases: 'text',
  checkbox: 'checkbox',
  date: 'date',
  datetime: 'datetime-local',
  multitext: 'text',
  number: 'number',
  tags: 'text',
  text: 'text',
};

export class Field {

  parentFile: FileData;
  name: string;
  data: Data;
  updaters: ((data: Data) => void)[];

  constructor(parentFile: FileData, name: string, data: Data) {
    this.parentFile = parentFile;
    this.name = name;
    this.data = data;
    this.updaters = [];
  }

  getValue() {
    return this.data?.toString() || '';
  }

  update(value: string) {
    this.data = value;
    this.updaters.map((x) => x(value));
  }

  fixed(el: HTMLElement) {
    return el.createEl('span', {text: this.getValue()});
  }

  dynamic(el: HTMLElement) {
    const container = el.createEl('div', {text: this.getValue()});
    this.updaters.push(updater(container));
    return container;
  }

  editable(el: HTMLElement) {
    const type = this.parentFile.plugin.types[this.name];
    const container = el.createEl('input', {
      value: this.getValue(),
      type: inputTypes[type],
    });
    if (type == 'checkbox') {
      container.addEventListener('change',
          listener(this.parentFile, this.name, type));
    } else {
      container.addEventListener('input',
          listener(this.parentFile, this.name, type));
    }
    this.updaters.push(updater(container));
    return container;
  }

}

function updater(el: HTMLElement) {
  return (value: string) => {
    if (el instanceof HTMLInputElement) {
      if (el.matches('[type="checkbox"]')) {
        el.checked = Boolean(value);
      } else {
        el.value = value;
      }
    } else {
      el.innerHTML = value;
    }
  };
}

function listener(file: FileData, name: string, dataType: string) {
  return async (event: InputEvent)=>{
    const target = (event?.target as HTMLInputElement);
    let value;
    if (dataType == 'checkbox') {
      value = target.checked;
    } else {
      value = target.value;
    }
    await file.editField(name, value, dataType);
  };
}
