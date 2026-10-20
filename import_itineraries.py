from pathlib import Path
import re,json,unicodedata,collections
root=Path(__file__).parent;p=root/'dist'
raw=(root/'source-itineraries.txt').read_text();(root/'source-itineraries.txt').write_text(raw)
source='https://registro.sp.gov.br/horarios-de-onibus/'
titles=list(re.finditer(r'^(L[3-9]|R[234])\s*-\s*(.+)$|^(RIBEIRÃO BRANCO/ LAGEADO)$',raw,re.M));schedule={};lines=[];issues=[]
nameMap={'L3':'Arapongal','L4':'Paulistano','L5':'Faculdade','L6':'Agrochá / Vila Romão','L7':'Xangrilá','L8':'Serrote','L9':'Jardim São Paulo','R2':'Capinzal / Indaiatuba','R3':'Votupoca / Bulha','R4':'Guaviruva / Peropava','R6':'Ribeirão Branco / Lageado'}
origins={'L3':['Movep','Arapongal'],'L4':['Movep','Jardim Paulistano'],'L5':['Fundação Bradesco','Faculdade'],'L6':['Rodoviária','Agrochá / IFSP, conforme viagem'],'L7':['Fundação Bradesco','Jardim Xangrilá'],'L8':['Movep','Serrote'],'L9':['Fundação Bradesco','Jardim São Paulo'],'R2':['Rodoviária','Capinzal / Indaiatuba'],'R3':['Rodoviária','Votupoca / Bulha'],'R4':['Rodoviária','Origem com divergência na fonte'],'R6':['Rodoviária','Ribeirão Branco']}
timepat=re.compile(r'(?<!\d)(\d{1,2})\s*(?:[hH]\s*:?|:\s*[hH]?)\s*(\d{2})(?!\d)')
def parse_times(text,variant='Padrão'):
 matches=[m for m in timepat.finditer(text) if text[:m.start()].count('(')==text[:m.start()].count(')')];out=[]
 for i,m in enumerate(matches):
  # Keep times inside parentheses as notes, not extra departures (IFSP 22:30 / 22:35).
  pre=text[:m.start()]
  if pre.count('(')>pre.count(')'):continue
  end=matches[i+1].start() if i+1<len(matches) else len(text);tail=text[m.end():end].strip(' –-\n')
  # Associate a question mark before a separator with the preceding time, and a leading one with this time.
  uncertain='?' in tail or bool(re.search(r'[-–]\s*\?\s*$',pre))
  note=tail.replace('?','').strip(' –-\n');note=note.strip('()')
  tm=f'{int(m[1]):02}:{m[2]}'
  if int(m[1])>23 or int(m[2])>59:raise ValueError(tm)
  out.append(dict(time=tm,note=note,variant=variant,uncertain=uncertain,sourceStatus='published'))
 return out
for idx,m in enumerate(titles):
 code=m[1] or 'R6';end=titles[idx+1].start() if idx+1<len(titles) else raw.index('Ônibus Universitário');text=raw[m.end():end].strip();day='week';direction=None;variant='Padrão';capture=False;buf=[];buckets=collections.defaultdict(lambda:[[],[]]);localIssues=[]
 def flush():
  global buf
  if buf and direction is not None:
   entries=parse_times('\n'.join(buf),variant)
   buckets[day][direction].extend(entries)
  buf=[]
 for ln in text.splitlines():
  st=ln.strip()
  if not st:continue
  if re.match(r'^(Segunda|Sábado|Domingo|Terça - Quarta)',st,re.I):
   flush();day='sat' if st.startswith('Sábado') else 'sun' if st.startswith('Domingo') else 'tuewedfri' if st.startswith('Terça') else 'week';capture=False;direction=None;variant='Padrão';continue
  head=re.match(r'^[LR](\d)([12])\s*[–-]',st)
  noCode=re.match(r'^Saindo d',st,re.I)
  ambiguous=st.startswith('SAINDO DO JARDIM SÃO PAULO')
  if head or noCode or ambiguous:
   flush();direction=int(head[2])-1 if head else 1 if ('Ribeirão Branco' in st or ambiguous) else 0;capture=True;variant='Padrão'
   if head and head[1]!=code[1:]:localIssues.append('A fonte usa '+head[0].rstrip(' –-')+' dentro da seção '+code+'. Associação mantida pela seção e pelo sentido; confirmar código.')
   if code=='R4' and 'Votupoca' in st:localIssues.append('O cabeçalho da R4 cita Votupoca, embora a linha seja Guaviruva / Peropava. Confirmar a origem e o sentido de retorno.')
   if ambiguous:localIssues.append('A L9 apresenta duas grades para o retorno no sábado. Ambas foram mantidas como a confirmar; nenhuma foi escolhida automaticamente.')
   continue
  if st in ['VIA BR','VIA VILA ROMÃO']:
   flush();variant='Via BR' if st=='VIA BR' else 'Via Vila Romão';capture=True;continue
  if st.startswith(('Itinerário','*','Observação','Ônibus Rural')):
   flush();capture=False;continue
  if capture and timepat.search(st):buf.append(st)
  elif capture:flush();capture=False
 flush()
 if code=='L9':
  for x in buckets['sat'][1]:x['uncertain']=True;x['note']=(x['note']+' · Grades conflitantes na fonte').strip(' ·')
 if code=='L4':
  localIssues.append('A página da Prefeitura anuncia substituição de 14:00 por 15:00 a partir de 13/9, sem ano, mas a grade ainda lista ambos. Saída 14:00 marcada a confirmar.')
  for d in ['week','sat']:
   for x in buckets[d][0]:
    if x['time']=='14:00':x['uncertain']=True;x['note']='Aviso de substituição por 15:00 na fonte; confirmar vigência'
 if code=='R4':localIssues.append('A lista informa retorno 12:40, mas a descrição do itinerário cita 12:30. Há também observação 17:30 dentro da seção de domingo. Confirmar variantes e horários.')
 if code=='L9':localIssues.append('No domingo a fonte lista as mesmas horas para os dois sentidos; confirmar se a grade é intencional.')
 if code=='L7':localIssues.append('A grade de retorno lista 18:35, mas a variante universitária é descrita às 18:45. Confirmar a viagem universitária.')
 if code=='L6':localIssues.append('As viagens via BR e via Vila Romão têm grades distintas. A saída 22:40 é do IFSP; a viagem 22:20 sai do Agrochá com parada no IFSP. Não tratar as origens como iguais.')
 for d,arr in buckets.items():
  for entries in arr:entries.sort(key=lambda x:x['time'])
 schedule[code]=dict(buckets)
 lines.append(dict(id=code,name=nameMap[code],kind='Rural' if code.startswith('R') else 'Urbana',source=source,text=text,images=[],origins=origins[code],issues=list(dict.fromkeys(localIssues)),dayKeys=list(buckets),verifiedAt='2026-10-20',operationallyValidated=False))
 for issue in localIssues:issues.append(dict(line=code,issue=issue))
# The supplied text names each university trip independently; preserve its exact published code.
uni=raw[raw.index('Ônibus Universitário'):raw.index('Conheça Registro')];u=list(re.finditer(r'^(U\d+)\s*-\s*(.+)$',uni,re.M));uniTrips=[]
for i,m in enumerate(u):
 section=uni[m.end():u[i+1].start() if i+1<len(u) else len(uni)];entries=parse_times(section,'Universitário');uniTrips.append((m[1],m[2],entries))
for id,name,pair in [('U3','Arapongal ↔ Faculdade',['U31','U32']),('U7','Xangrilá ↔ Faculdade',['U71','U52']),('U6','Agrochá ↔ Faculdade',['U61','U62']),('U8','Serrote ↔ Faculdade',['U81','U82'])]:
 arr=[]
 for code in pair:
  item=next(x for x in uniTrips if x[0]==code)
  for entry in item[2]:entry['tripCode']=code
  arr.append(item[2])
 schedule[id]={'week':arr};lines.append(dict(id=id,name=name,kind='Universitária',source=source,text='\n\n'.join(x[0]+' — '+x[1]+'\n'+'\n'.join(y['time']+' '+y['note'] for y in x[2]) for x in uniTrips if x[0] in pair),images=[],origins=['Bairro → Faculdade','Faculdade → Bairro'],issues=['Operação vinculada ao calendário letivo; confirmar vigência.']+(['O código de volta aparece como U52 na fonte, preservado sem alteração.'] if id=='U7' else []),dayKeys=['week'],verifiedAt='2026-10-20',operationallyValidated=False))
for file,data in [('lines.json',lines),('schedules.json',schedule),('validation.json',dict(source=source,checkedAt='2026-10-20',status='source-compared-not-operationally-validated',issues=issues))]: (p/file).write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Lines:',len(lines),'Departures:',sum(len(v) for l in schedule.values() for a in l.values() for v in a),'Questionable:',sum(x['uncertain'] for l in schedule.values() for a in l.values() for v in a for x in v))
for code in schedule:print(code,{d:[len(x) for x in a] for d,a in schedule[code].items()})
