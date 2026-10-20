from pathlib import Path
import json,re
p=Path(__file__).resolve().parents[2]/'src'/'data';lines=json.loads((p/'lines.json').read_text())
for l in lines:
 refs=[[],[]];d=None
 for line in l['text'].splitlines():
  h=re.match(r'^[LR]\d([12])\s*[–-]',line)
  if h:d=int(h[1])-1
  if line.startswith('Itinerário:') and d is not None and not refs[d]:refs[d]=[x.strip() for x in re.split(r'\s+[–-]\s+',line.split(':',1)[1]) if x.strip()]
 l['routeReferences']=refs
(p/'lines.json').write_text(json.dumps(lines,ensure_ascii=False,indent=2))
