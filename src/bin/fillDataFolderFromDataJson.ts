import {join} from 'path';
import {mkdir, writeFile} from 'fs';
import {Record} from '../shared/record/record';

/* tslint:disable */
const db = require('../../data/.db.json');
/* tslint:enable */

Object.keys(db).map((k: any) => {
  if (typeof k === 'string' ) {
    if (Record.isProtoRecord(db[k])) {
      return Record.fromObj(db[k]);
    }
  }
}).map((r: Record) => {
  const dataPath = join(__dirname, '../../data', r.id);
  mkdir(dataPath, () => {
    writeFile(
        join(dataPath, `${r.id}.json`),
        JSON.stringify(r)
    );
  });
});

