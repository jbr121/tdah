import React from 'react'

export default function AdhdTips({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75">
      <div
        className="rounded-t-3xl border-t border-line bg-panel px-5 pt-4"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))', maxHeight: '80vh', overflow: 'auto' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage">Ajuda</p>
            <h2 className="mt-1 text-[20px] font-medium tracking-tight text-cream">Dicas práticas para TDAH</h2>
          </div>
          <button type="button" onClick={onClose} className="text-mute">Fechar</button>
        </div>

        <section className="mt-4 space-y-3">
          <h3 className="text-[15px] font-semibold text-cream">Principais dificuldades</h3>
          <ul className="list-disc ml-5 text-[14px] text-mute">
            <li>Time blindness — dificuldade em sentir a passagem do tempo.</li>
            <li>Iniciar tarefas — bloqueio na hora de começar.</li>
            <li>Sobrecarga / ansiedade com listas longas.</li>
            <li>Memória de trabalho curta — esquecer ideias no meio do caminho.</li>
            <li>Dificuldade de transição (sair do foco / parar o hiperfoco).</li>
          </ul>
        </section>

        <section className="mt-3 space-y-3">
          <h3 className="text-[15px] font-semibold text-cream">Como o app ajuda</h3>
          <ul className="list-disc ml-5 text-[14px] text-mute">
            <li>
              Visualizar o tempo: usamos timers curtos ("Só 2 min") e anéis visuais para você sentir o tempo, não só ver números.
            </li>
            <li>
              Inicie com pouco: comece com 2 minutos para atravessar a barreira de começar — depois decide se continua.
            </li>
            <li>
              Capture rápido: escreva a ideia sem escolher o tipo. Organizar pode esperar — o importante é colocar para fora.
            </li>
            <li>
              Parkear pensamentos: durante foco, toque "Tá na cabeça" para guardar uma ideia sem perder o ciclo.
            </li>
            <li>
              Resto sobre o app: o filtro não apaga o resto; a lista longa fica quieta e não te cobra.
            </li>
          </ul>
        </section>

        <section className="mt-3 space-y-3">
          <h3 className="text-[15px] font-semibold text-cream">Práticas recomendadas</h3>
          <ol className="list-decimal ml-5 text-[14px] text-mute space-y-2">
            <li>Use um timer visual para tarefas importantes (2–10 min para começar).</li>
            <li>Quebre tarefas em passos pequenos — 1 ação por passo.</li>
            <li>Permita pausas curtas e "já deu" — pausar não é fracasso.</li>
            <li>Prefira lembretes visuais e vibração suave em vez de alarmes altos.</li>
            <li>Revise o que foi feito no final do dia — celebra pequenas vitórias.</li>
          </ol>
        </section>

        <section className="mt-4 mb-2">
          <p className="text-[13px] text-mute">
            Recursos externos: organizações como CHADD, NHS e materiais sobre 'time blindness' e 'executive function' têm guias úteis.
          </p>
        </section>
      </div>
    </div>
  )
}

