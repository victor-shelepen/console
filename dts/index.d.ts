/// <reference types="node" />

declare module 'cli' {
  export type TArgs = {[key: string]: string | string[]}

  export interface ICommandData {
    token: string;
    name: string;
    group: string;
    values: string[];
    args: TArgs
  }

  export interface ICommandItem {
    token: string;
    name: string;
    group: string;
    title: string;
    description?: string;
    args: {
      name: string,
      description: string
    }[];
    handler (command: ICommandData): Promise<any> | any;
  }

  export function parse(str: string): ICommandData;
  export function extractValue(args: TArgs, key: string, defaultVal?:string): string | string[];
}
