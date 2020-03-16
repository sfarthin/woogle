import Datastore from 'nedb';
import { Page } from './types';

/**
 * This is a in-memory MongoDB
 */
const db = new Datastore({ filename: '/tmp/pagesDataStore', autoload: true });

export default {
  add: (page: Page): Promise<Page> =>
    new Promise((res, rej) =>
      db.insert(page, function(err: any, newDoc: Page) {
        if (err) {
          rej(err);
        } else {
          res(newDoc);
        }
      })
    ),
  get: (url: string): Promise<Page | void> =>
    new Promise((res, rej) =>
      db.find({ url }, function(err: any, docs: Page[]) {
        if (err) {
          rej(err);
        } else {
          res(docs[0]);
        }
      })
    )
};
