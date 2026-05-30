import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync('tmp-openapi.json','utf8'));
let count=0;
for (const [path,item] of Object.entries(spec.paths)) {
  for (const method of Object.keys(item).filter(k=>['get','post','put','patch','delete'].includes(k))) {
    count++;
    const op=item[method];
    console.log(`${method.toUpperCase()} ${path} :: ${op.summary||''}`);
  }
}
console.error(`TOTAL ${count}`);
