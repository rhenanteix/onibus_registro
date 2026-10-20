from pathlib import Path
import json,re,unicodedata,collections
p=Path('dist');lines=json.loads((p/'lines.json').read_text());features=json.loads((Path(__file__).parent/'reference-geocoding-index.json').read_text());cache=json.load(open('geocoding.json'))
def norm(s):
 s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
 s=re.sub(r'\([^)]*\)','',s);s=s.replace('pocci','poci').replace('peroupava','peropava').replace('san conrado','sao conrado')
 for a,b in [('av.','avenida '),('r.','rua '),('estr.','estrada '),('cel.','coronel '),('cap.','capitao '),('dep.','deputado '),('pref.','prefeito ')]:s=s.replace(a,b)
 return re.sub(r'[^a-z0-9]+',' ',s).strip()
index=collections.defaultdict(list)
for x in features:index[norm(x['name'])].append(x)
aliases={'movep':'MOVEP','centro':'Centro','arapongal':'Bairro Arapongal Oeste','agrocha':'Jardim Agrochá I','faculdade':'FIVR','fundacao bradesco':'Escola de Ensino Básico e Profissional Fundação Bradesco','rodoviaria':'Rodoviária de Registro','jardim virginia':'Jardim Virgínia','c h eiji matsumura':'Jardim Eiji Matsumura','c h alzira pacheco l k d1 e c h eiji matsumura d2':'Jardim Doutora Alzira Pacheco Lomba Kótona I','unesp':'Unesp','jardim san conrado':'Jardim São Conrado','rua shitiro maeji':'Rua Shitiro Maeji','c h alzira pacheco l k':'Jardim Doutora Alzira Pacheco Lomba Kótona I','av h matsuzawa':'Rua H Matsuzawa','avenida h matsuzawa':'Rua H Matsuzawa','avenida dep ulisses guimaraes':'Avenida Deputado Ulysses Guimarães','avenida deputado ulisses guimaraes':'Avenida Deputado Ulysses Guimarães','rua jose antonio de campos':'Rua José Antônio de Campos','rua joao batista poci junior':'Rua João Batista Pocci Júnior','rua cap joao poci':'Rua Capitão João Pocci','rua capitao joao poci':'Rua Capitão João Pocci','ifsp':'Instituto Federal de São Paulo - Câmpus Registro','jardim paulistano':'Jardim Paulistano','nosso teto':'Nosso Teto','guaviruva':'Ilha de Guaviruva','integracao arapongal':'Bairro Arapongal Oeste','integracao agrocha':'Jardim Agrochá I'}
# Locations are references only. A road midpoint or neighborhood centre is never a boarding stop.
def position(label):
 k=norm(label);target=aliases.get(k,label);matches=index.get(norm(target),[])
 if not matches:
  # Match exact road names in the existing, inspected geocoding cache; never accept a generic Registro fallback.
  keys=[key for key in cache if norm(key)==k or norm(key)==norm(target)]
  if keys:
   c=cache[keys[0]]
   if c.get('label') not in ['Registro, São Paulo','Registro, São Paulo, Brasil']:
    return {'lat':c['coords'][1],'lon':c['coords'][0],'method':'approximate-reference','source':c.get('source','https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'),'matchedName':c.get('label',label)}
  return None
 # Prefer actual named nodes over ways, especially POIs and neighborhood nodes.
 x=sorted(matches,key=lambda x:('way/' in x['source'],x['source']))[0]
 return {'lat':x['coords'][1],'lon':x['coords'][0],'method':'approximate-reference','source':x['source'],'matchedName':x['name']}
def points(text):
 return [x.strip(' .') for x in re.split(r'\s+[–-]\s+',text) if x.strip(' .')]
journeys={}
for l in lines:
 arr=[];text=l['text'];d=0
 def add(label,d,refs,kind='regular',sourceText='',inherited=None):
  if not refs:return
  j={'id':l['id']+'-'+str(d)+'-'+str(len(arr)),'lineId':l['id'],'label':label,'direction':d,'kind':kind,'source':l['source'],'sourceText':sourceText,'boardingValidated':False,'points':[]}
  if inherited:j['inheritedFrom']=inherited
  for seq,name in enumerate(refs):j['points'].append({'id':j['id']+'-p'+str(seq+1),'sequence':seq+1,'label':name,'pointKind':'reference','boardingValidated':False,'position':position(name)})
  # Do not duplicate identical route variants copied again under Saturday headings.
  if not any(a['direction']==d and [p['label'] for p in a['points']]==refs for a in arr):arr.append(j)
 for ln in text.splitlines():
  head=re.match(r'^[LR]\d([12])\s*[–-]',ln)
  if head:d=int(head[1])-1
  if ln.startswith('Itinerário:'):add('Percurso principal',d,points(ln.split(':',1)[1]),sourceText=ln)
  elif ln.startswith('Itinerário das'):
   label,route=re.split(r':\s+',ln,maxsplit=1);add(label,d,points(route),kind='timed',sourceText=ln)
 # Explicit special itinerary headings are followed by their listed road sequence.
 rawLines=text.splitlines()
 for i,ln in enumerate(rawLines):
  if ln.lstrip('* ').startswith('Itinerário ') and 'Faculdade' in ln:
   label=ln.lstrip('* ').replace('Itinerário ','',1);j=i+1
   while j<len(rawLines) and not rawLines[j].strip():j+=1
   if j<len(rawLines) and not re.match(r'^[LR]\d',rawLines[j]):add(label,0 if label.startswith('Faculdade') else 1,points(rawLines[j]),'university-variant',rawLines[j])
 # Preserve endpoints explicitly published when the supplied text has no street-by-street sequence.
 for direction in (0,1):
  if not any(x['direction']==direction and x['kind'] in ['regular','timed'] for x in arr) and l['kind']!='Universitária':
   origin=l['origins'][direction];dest=('Agrochá' if l['id']=='L6' else l['name']) if direction==0 else 'Rodoviária' if l['id'].startswith('R') or l['id']=='L6' else 'Centro'
   if l['id']=='L6':
    for via in ['BR-116','Vila Romão']:add('Via '+via+' · sequência parcial',direction,[origin.replace(' / IFSP, conforme viagem',''),via,dest],'partial','Cabeçalho e variante do material fornecido; sequência detalhada não publicada.')
    if direction==1:add('Viagem 22:20 · parada no IFSP',1,['Agrochá','IFSP'],'timed','Saída Agrochá 22:20; IFSP 22:30, saída 22:35. Ver material fornecido.')
   else:add('Origem e destino · sequência parcial',direction,[origin,dest],'partial','Origem e destino publicados; sem lista de paradas intermediárias.')
 journeys[l['id']]=arr
# University trips: copy only the explicit university sequence provided in the source. Return sequences with only transfer information remain partial.
upairs={'U3':('L3','Arapongal', ['Faculdade','Centro','Integração Arapongal']),'U7':('L7','Jardim Xangrilá',['Faculdade','Jardim das Palmeiras','Nosso Teto','Jardim América','Vila Ribeirópolis','Rodoviária','Centro','Fundação Bradesco','Jardim Xangrilá']),'U6':('L6','Agrochá',['Faculdade','Centro','Integração Agrochá']),'U8':('L8','Serrote',['Faculdade','Serrote / Arapongal'])}
for uid,(parent,origin,ret) in upairs.items():
 line=next(x for x in lines if x['id']==uid);base=next((j for j in journeys[parent] if j['direction']==1 and j['kind']=='university-variant'),None)
 for direction,refs in [(0,[x['label'] for x in base['points']] if base else [origin,'Faculdade']),(1,ret)]:
  j={'id':uid+'-'+str(direction),'lineId':uid,'label':'Ida à faculdade' if direction==0 else 'Volta / integração publicada','direction':direction,'kind':'university-variant' if base and direction==0 else 'partial','source':line['source'],'sourceText':line['text'],'boardingValidated':False,'points':[]}
  if base and direction==0:j['inheritedFrom']=base['id']
  for seq,name in enumerate(refs):j['points'].append({'id':j['id']+'-p'+str(seq+1),'sequence':seq+1,'label':name,'pointKind':'reference','boardingValidated':False,'position':position(name)})
  journeys[uid].append(j)
(p/'journeys.json').write_text(json.dumps(journeys,ensure_ascii=False,indent=2))
print('Journeys:',sum(len(x) for x in journeys.values()),'references:',sum(len(j['points']) for a in journeys.values() for j in a),'geolocated:',sum(bool(p['position']) for a in journeys.values() for j in a for p in j['points']))
for id,a in journeys.items():print(id,[(j['direction'],j['label'],len(j['points']),sum(bool(x['position']) for x in j['points'])) for j in a])
