export type Page = {
  url: string;
  title: string | null;
  links: Array<string>;
};

export type SimpleQueue = {
  registerCrawlers: (i: number) => void;
  unRegisterCrawlers: (i: number) => void;
  enqueue: (newQueuedItems: string[]) => Promise<void>;
  dequeue: () => Promise<string | void>;
};
