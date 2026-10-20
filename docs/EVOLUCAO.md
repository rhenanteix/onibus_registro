# Plano de evolução

1. **Homologar a base**: operadora confirma ID, nome, coordenada, lado da rua e sequências de cada ponto; calendário e vigência de cada viagem; shapes por sentido/variante. Aceite: piloto com ida e volta de uma linha validado em campo e pela operação.
2. **Planejar viagem**: origem, destino, geocodificação, caminhada e conexão. Aceite: apresentar local real de embarque, horário por serviço e trajeto até o destino com fonte e validade; nenhum cálculo sobre referências aproximadas de bairro.
3. **Administração**: login e papéis, importação GTFS/planilhas, revisão e publicação, logs e reversão. Aceite: editor altera rascunho sem afetar produção; revisor publica versão auditável.
4. **GPS**: obter contrato/API; normalizar veículos e viagens, monitorar atraso de coleta, ocultar posição vencida. Aceite: dados reais com timestamps e comportamento testado para indisponibilidade.
5. **Previsões**: associar veículo a viagem e ponto, combinar grade e posição. Aceite: medir erro real da previsão e comunicar incerteza.
6. **Fotos / acessibilidade**: comprovar posição do ponto, autorização de uso das fotos, abrigo, rampa, iluminação. Aceite: foto e coordenada revisadas, com data e autoria.
7. **Alertas**: desvios com vigência, linhas afetadas e origem oficial. Push opt-in e lembretes só após backend e consentimento.
8. **Créditos**: bilhetagem autorizada, identidade, saldo, pedido, pagamento, conciliação, confirmação de carga e suporte. Aceite: estados financeiros e de carga separados e validados com o fornecedor.

## UX desta reestruturação

Mapa como instrumento de orientação e painel de viagem como conteúdo principal; identidade sóbria em verde, papel claro e cor por tipo de serviço; tipografia utilitária e controles claros. Sem slogans de marketing no fluxo de viagem, sem mapas decorativos e sem previsão inventada.

Desktop: lista de linhas, detalhe do percurso e mapa em três áreas. Celular: lista → detalhe, com alternância explícita para mapa e retorno. Uma sequência de referência sem coordenada continua na tela; uma geometria ausente não é substituída por uma linha reta.

## Limitações de verificação

Verificações executadas e seus resultados são registrados na entrega. Instalação nativa, permissões físicas de localização e comportamento em Safari/Android exigem homologação nos dispositivos reais. Passar em build e testes não equivale à validação operacional do transporte.
