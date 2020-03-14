export type Page = {
  url: string;
  title: string | null;
  links: Array<string>;
};

export type SimpleQueue = {
  registerWorker: () => void;
  unRegisterWorker: () => void;
  enqueue: (newQueuedItems: string[]) => Promise<void>;
  dequeue: () => Promise<string | void>;
};
