# Calendário de feriados

O portal aplica sozinho a grade "Domingo / feriado" quando a data de hoje é um
feriado. O calendário vive em `src/data/feriados.json` e as regras em
`src/lib/feriados.ts`.

## Como funciona

1. `src/lib/feriados.ts` lê `src/data/feriados.json` e valida o schema.
2. A data usada é sempre a de São Paulo (`America/Sao_Paulo`), calculada por
   `saoPauloDateKey` em `src/lib/domain.ts`. A máquina do usuário não muda o
   resultado.
3. `gradeForLine(dayKeys, dateKey)` devolve a grade do dia:
   - se a data é **feriado** e a linha publica a grade `sun`, a grade de
     domingo/feriado é aplicada;
   - se a data é **feriado** e a linha não publica a grade `sun` (R6 e as
     linhas universitárias), a grade do dia é mantida e a interface avisa;
   - **ponto facultativo** não troca a grade sozinho, porque o horário da
     operadora nesses dias não foi confirmado.
4. A escolha manual do usuário tem precedência: o seletor "Dia da viagem"
   continua disponível, e o botão "Voltar à grade de hoje" desfaz a seleção
   manual.
5. A interface mostra um aviso quando a grade de feriado está em uso, e o
   painel "Calendário de feriados e fontes" lista todas as datas com a
   respective fonte.
6. O catálogo servido em `/api/catalog` também leva o calendário, para que a
   consulta offline (`public/offline.js`) sinalize o feriado do dia e marque a
   grade de domingo/feriado.

## Como adicionar um feriado

1. Edite `src/data/feriados.json` e acrescente um item em `holidays`:

```json
{
  "date": "2027-11-30",
  "name": "Emancipação do Município de Registro",
  "scope": "municipal",
  "type": "feriado",
  "status": "publicado",
  "source": "https://registro.sp.gov.br/feriados-municipais/",
  "sourceLabel": "Prefeitura de Registro: Lei Orgânica (art. 238) e Lei Municipal nº 595/1985",
  "legalBasis": "Lei Orgânica do Município de Registro, art. 238; Lei Municipal nº 595/1985",
  "checkedAt": "2026-10-20"
}
```

2. Campos e valores aceitos:

| Campo         | Valores                             | Observação                                                                                                                                                   |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `date`        | `AAAA-MM-DD`                        | Data real, no fuso de São Paulo                                                                                                                              |
| `name`        | texto                               | Nome do feriado como aparece na fonte                                                                                                                        |
| `scope`       | `nacional`, `estadual`, `municipal` | A esfera que institui o feriado                                                                                                                              |
| `type`        | `feriado`, `ponto_facultativo`      | Só `feriado` troca a grade sozinho                                                                                                                           |
| `status`      | `publicado`, `previsto`             | `publicado` = consta de portaria ou decreto do ano; `previsto` = decorre de lei permanente ou do calendário pascal e ainda não há calendário anual publicado |
| `source`      | endereço `https`                    | Fonte oficial que sustenta a data                                                                                                                            |
| `sourceLabel` | texto                               | Como a fonte é citada na interface                                                                                                                           |
| `legalBasis`  | texto                               | Lei, decreto ou portaria que institui o feriado                                                                                                              |
| `note`        | texto, opcional                     | Detalhe da confirmação (data do decreto, calendário municipal)                                                                                               |
| `checkedAt`   | `AAAA-MM-DD`                        | Data da conferência da fonte                                                                                                                                 |

3. O mesmo item não pode se repetir: a chave de conferência é
   `data + scope + nome`. Datas iguais com esferas diferentes são esperadas
   (por exemplo, 3 de abril é feriado nacional e municipal).

4. Rode `npm test`. O teste `tests/feriados.test.ts` valida o schema, exige
   fonte em todos os itens, confere que os feriados municipais de Registro
   vêm de `registro.sp.gov.br` e verifica a aplicação da grade.

## Fontes usadas hoje

| Esfera          | Fonte                                                                                                   | Endereço                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Federal, 2026   | Portaria MGI nº 11.460, de 29/12/2025 (DOU 30/12/2025)                                                  | https://www.in.gov.br/web/dou/-/portaria-mgi-n-11.460-de-29-de-dezembro-de-2025-678388627 |
| Federal, lei    | Lei nº 662/1949, Lei nº 9.093/1995, Lei nº 14.759/2023                                                  | https://www.planalto.gov.br/ccivil_03/leis/l2789.htm                                      |
| Estadual SP     | Lei estadual nº 9.497, de 5/3/1997 (data magna, 9 de julho)                                             | https://www.al.sp.gov.br/repositorio/legislacao/lei/1997/lei-9497-05.03.1997.html         |
| Municipal       | Lei Orgânica (art. 238), Lei Municipal nº 1.248/2012, Lei Municipal nº 595/1985, decretos da Prefeitura | https://registro.sp.gov.br/feriados-municipais/                                           |
| Municipal, 2026 | Decreto municipal nº 4.148, de 27/1/2026 (pontos facultativos)                                          | https://registro.sp.gov.br/wp-content/uploads/2026/02/Dec_4148_26.pdf                     |

## Regras que não devem ser furadas

- **Feriado municipal não se infere.** A data vem de lei municipal ou de
  decreto da Prefeitura. Datas de calendário anual municipal que ainda não
  foram publicadas não entram no arquivo.
- **Não invente data.** Se a fonte oficial do ano ainda não existe, o item
  entra com `status: "previsto"` e `source` apontando para a lei permanente.
  Data de calendário pascal (Carnaval, Sexta-feira Santa, Corpus Christi) é
  calculada, e o cálculo é conferido contra a portaria do ano anterior.
- **Ponto facultativo não troca a grade sozinho.** Se a operadora publicar
  horário próprio para um ponto facultativo, registre a regra em
  `src/lib/feriados.ts` e não no arquivo de dados.
- **Atualize `updatedAt`** no topo do arquivo e a data de conferência
  (`checkedAt`) de cada item alterado.

## Atualização anual

No fim de cada ano:

1. Publicada a portaria federal do ano, inclua os feriados e pontos
   facultativos com `status: "publicado"` e `source` da portaria.
2. Publicado o decreto municipal do ano, atualize os itens municipais e
   acrescente os pontos facultativos municipais que não existam.
3. Confira os itens `previsto` do ano anterior: os que virarem `publicado`
   trocam de status e passam a citar o documento anual.
4. Rode `npm test` e `npm run build`.
