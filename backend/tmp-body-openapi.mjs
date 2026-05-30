import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync('tmp-openapi.json','utf8'));
for (const [path,item] of Object.entries(spec.paths)) {
  for (const method of Object.keys(item).filter(k=>['post','put','patch'].includes(k))) {
    const op=item[method];
    const content=op.requestBody?.content||{};
    const mt=Object.keys(content).join(',');
    const schema=content['application/json']?.schema || content['multipart/form-data']?.schema || {};
    console.log('\n'+method.toUpperCase(), path, mt);
    console.log(JSON.stringify(schema.properties||schema, null, 2).slice(0,1200));
  }
}
