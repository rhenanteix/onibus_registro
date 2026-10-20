import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export const metadata: Metadata = {
  title: "Como usar o transporte",
  description:
    "Saiba como encontrar linhas de ônibus em Registro, usar sua localização, consultar horários e ativar lembretes de saída.",
  alternates: { canonical: "/como-usar" },
};
const questions = [
  [
    "Como ativar um lembrete de saída?",
    "Escolha uma linha e, nos detalhes da próxima saída de hoje, toque em Lembrar desta saída. O aviso considera 10 minutos antes do horário na origem, não a chegada ao ponto. Autorize as notificações se desejar; sem permissão, o aviso aparece na página. Mantenha o site aberto e ativo: celular bloqueado, aba suspensa ou site fechado não têm entrega garantida. Você pode cancelar o lembrete a qualquer momento.",
  ],
  [
    "Como encontrar meu ônibus?",
    "Digite o nome do bairro, destino ou número da linha na busca. Escolha uma linha para conferir o local de saída, o sentido da viagem e os horários. Use a estrela para guardar suas favoritas neste aparelho.",
  ],
  [
    "Consigo ver onde o ônibus está agora?",
    "Ainda não. O Mobilidade Registro não recebe GPS da frota. O mapa apresenta referências do percurso, e os horários são saídas publicadas na origem, não previsões de chegada ao seu ponto.",
  ],
  [
    "Como saber onde eu estou?",
    "Toque em Encontrar ônibus perto de mim e permita o acesso no navegador. O portal sugere uma linha próxima quando há referências a até 2 km e a precisão permite. Confira o sentido da viagem. Use Ver onde estou para centralizar o ponto azul no mapa. A localização do seu aparelho é diferente da localização do ônibus. Você pode desligá-la a qualquer momento.",
  ],
  [
    "Como conferir de onde o ônibus sai?",
    "Escolha uma linha e leia Saindo de e Em direção a. Use Inverter sentido para consultar o caminho contrário. Confira o dia da viagem e as notas de cada horário: alguns percursos têm variações.",
  ],
  [
    "Os pontos de embarque estão confirmados?",
    "Ruas e bairros ajudam a entender o trajeto, mas não garantem um ponto de embarque. O mapa indica referências aproximadas ou confirmadas; confirme o local de embarque e a operação com a operadora.",
  ],
  [
    "De onde vêm os horários?",
    "A base reúne informações públicas de transporte de Registro, São Paulo. Nos detalhes de cada linha, abra Fonte, vigência e texto publicado para consultar o documento e sua data de conferência. O projeto é independente e a vigência operacional ainda precisa de confirmação.",
  ],
];
export default function HowToUse() {
  return (
    <main className="passenger-help" id="conteudo" tabIndex={-1}>
      <Link className="back-link" href="/">
        <ArrowLeft size={18} /> Voltar ao mapa e às linhas
      </Link>
      <header>
        <span className="eyebrow">VIAJE COM MAIS CLAREZA</span>
        <h1>Seu guia para usar o transporte</h1>
        <p className="muted">
          Entenda como consultar linhas, se localizar e acompanhar os horários
          em Registro.
        </p>
      </header>
      <div className="help-grid">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <p className="help-source">
        Projeto independente sobre a mobilidade em Registro, SP. Consulte também
        os{" "}
        <a
          href="https://registro.sp.gov.br/horarios-de-onibus/"
          target="_blank"
          rel="noopener noreferrer"
        >
          horários publicados pela Prefeitura de Registro (abre em outra aba)
        </a>
        .
      </p>
    </main>
  );
}
