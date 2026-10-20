const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
for(const file of ['lines.json','schedules.json','routes.json','journeys.json','stops.json','validation.json','manifest.webmanifest'])JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const lines=JSON.parse(fs.readFileSync(path.join(root,'lines.json')));const journeys=JSON.parse(fs.readFileSync(path.join(root,'journeys.json')));
assert.equal(lines.length,15);for(const line of lines){assert(journeys[line.id]);assert(journeys[line.id].some(j=>j.direction===0));assert(journeys[line.id].some(j=>j.direction===1));}
for(const file of ['index.html','app.js','style.css','sw.js','vendor/leaflet.js','vendor/leaflet.css','icon-192.png','icon-512.png'])assert(fs.statSync(path.join(root,file)).size>0);
console.log('Dados JSON, destinos, sentidos e arquivos estáticos verificados.');
