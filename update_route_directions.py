from pathlib import Path
import requests,json,concurrent.futures,unicodedata
p=Path('dist');routes=json.loads((p/'routes.json').read_text());c=json.load(open('geocoding.json'))
common=['Rua João Batista Poci Junior','Rua Gersoni Napoli','Rua Coronel Jeremias Muniz','Rua Capitão João Pocci','Rua Celso Xavier','Rua José Antônio de Campos']
paths={
'L3':[common+['Arapongal'],['Arapongal','Rodoviária de Registro','Rua José Antônio de Campos','Avenida Jonas Banks Leite','Rua Joaquim Marques Alves','Rua João Batista Poci Junior']],
'L4':[common+['Avenida Hatiro Matsuzawa','Rua Peru','Avenida Deputado Ulisses Guimarães','Estrada do Bamburral','Rua Vivaldo Pereira','Jardim Paulistano'],['Jardim Paulistano','Estrada do Bamburral','Avenida Deputado Ulisses Guimarães','Avenida Hatiro Matsuzawa','Rua José Antônio de Campos','Avenida Jonas Banks Leite','Rua Joaquim Marques Alves','Rua João Batista Poci Junior']],
'L5':[['Fundação Bradesco','Rua Joaquim Marques Alves']+common+['Avenida Hatiro Matsuzawa','Rua Peru','Avenida Deputado Ulisses Guimarães','Jardim das Palmeiras'],['Jardim das Palmeiras','Avenida Deputado Ulisses Guimarães','Avenida Hatiro Matsuzawa','Rua José Antônio de Campos','Avenida Jonas Banks Leite','Rua Joaquim Marques Alves','Fundação Bradesco']],
'L7':[['Fundação Bradesco']+common+['Avenida Clara Gianotti de Souza','Avenida Cecy Teixeira de Melo Almada','Jardim Xangrilá'],['Jardim Xangrilá','Avenida Clara Gianotti de Souza','Rua José Antônio de Campos','Avenida Jonas Banks Leite','Rua Joaquim Marques Alves','Fundação Bradesco']],
'L9':[['Fundação Bradesco']+common+['Avenida Hatiro Matsuzawa','Rua Peru','Avenida Deputado Ulisses Guimarães','Estrada do Bamburral','Rua Vivaldo Pereira','Jardim São Paulo'],['Jardim São Paulo','Estrada do Bamburral','Avenida Deputado Ulisses Guimarães','Avenida Hatiro Matsuzawa','Rua José Antônio de Campos','Avenida Jonas Banks Leite','Rua Joaquim Marques Alves','Fundação Bradesco']]}
# L6 variants in supplied material have different road itineraries not georeferenced; remove misleading single-route geometry.
routes.pop('L6',None)
def f(item):
 id,dirs=item;variants=[]
 for direction,names in enumerate(dirs):
  refs=[{'name':n,**c[n]} for n in names if n in c];points=';'.join(','.join(map(str,x['coords'])) for x in refs)
  try:
   data=requests.get('https://router.project-osrm.org/route/v1/driving/'+points,params={'overview':'full','geometries':'geojson'},timeout=20).json()
   if data.get('code')=='Ok':variants.append({'direction':direction,'geometry':data['routes'][0]['geometry'],'references':refs})
  except Exception:pass
 return id,{'status':'inferred','source':'https://registro.sp.gov.br/horarios-de-onibus/','method':'Referências de ida e volta da fonte, geocodificação e roteamento viário com perfil automóvel. Não é shape oficial. Ruas não geocodificadas e variantes especiais não representadas.','variants':variants}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
 for id,route in ex.map(f,paths.items()):
  if len(route['variants'])==2:routes[id]=route
(p/'routes.json').write_text(json.dumps(routes,ensure_ascii=False));print('Reference shapes:',list(routes),flush=True)
