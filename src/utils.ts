import EasyCode from 'main';
import {
  TFile,
} from 'obsidian';

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

export function patch<T>(original: T, changes: DeepPartial<T>): T {
  const copy = structuredClone(original);
  Object.entries(changes).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, copy);
  return copy;
}

export async function waitForActiveFile(
    plugin: EasyCode,
    maxTries: number = plugin.settings.startupWaitRetrys): Promise< TFile > {
  let file = plugin.app.workspace.getActiveFile();
  const tries = 1;
  while (!file) {
    if (tries >= maxTries) {
      throw Error('Exceeded maximum number of tyes!');
    }
    await wait(plugin.settings.startupWaitDelay);
    file = plugin.app.workspace.getActiveFile();
  }
  return file;
}

function wait(ms: number) {
  return new Promise( (resolve) => setTimeout(resolve, ms) );
}

export function arrayEquals<T>(list1: T[], list2: T[]) {
  return list1.length === list2.length &&
        list1.every((val, index) => val === list2[index]);
}

