import { McFunction } from "./types";

export type SelectorArgs = {
  [arg: string]: any;
};

export type SelectorFunction = (args: SelectorArgs) => Selector;

export type Selector = string | SelectorFunction;

export type Location = string;

export type TextNode =
  | string
  | {
      text: string;
      color?: string;
      clickEvent?: {};
      hoverEvent?: {
        action: "show_text";
        value: TextNode[];
      };
    };

export type LootEntry = {
  type: string;
  name: string;
  functions: Array<{
    function: McFunction | string;
    tag: string;
  }>;
};
