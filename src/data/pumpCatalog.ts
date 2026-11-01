/**
 * Catálogo de tipos de bomba da trilha "Bombas". Cada item tem conteúdo próprio (nada de cartão vazio):
 * os que ainda não têm modelo 3D aparecem como explicação em texto, e isso é dito claramente.
 * Conteúdo qualitativo; nenhum valor de pressão, vazão ou rendimento é informado.
 */

export type PumpFamily = 'dinamica' | 'rotativa' | 'alternativa';

export const PUMP_FAMILY_LABEL: Record<PumpFamily, string> = {
  dinamica: 'Dinâmica',
  rotativa: 'Deslocamento positivo · rotativa',
  alternativa: 'Deslocamento positivo · alternativa'
};

export interface PumpCatalogEntry {
  id: string;
  name: string;
  family: PumpFamily;
  /** Como funciona, em uma ou duas frases. */
  principle: string;
  usedFor: string;
  /** Um cuidado típico de manutenção ou operação. */
  care: string;
  /** Equipamento do laboratório 3D, quando existe. */
  labId?: string;
  /** Aula rápida relacionada, quando existe. */
  microId?: string;
}

export const PUMP_CATALOG: PumpCatalogEntry[] = [
  {
    id: 'centrifuga',
    name: 'Bomba centrífuga',
    family: 'dinamica',
    principle: 'O rotor gira e joga o líquido para fora com velocidade; a voluta transforma essa velocidade em pressão.',
    usedFor: 'Água, produtos de baixa viscosidade, resfriamento, abastecimento.',
    care: 'Não operar a seco nem com a sucção restrita (risco de cavitação e de dano ao selo).',
    labId: 'centrifugal-pump',
    microId: 'tec-bomba-tipos'
  },
  {
    id: 'engrenagens-externas',
    name: 'Bomba de engrenagens externas',
    family: 'rotativa',
    principle: 'Duas engrenagens iguais levam o líquido nos vãos dos dentes, pela parte de fora, da entrada até a saída.',
    usedFor: 'Óleo hidráulico, lubrificação forçada, líquidos viscosos.',
    care: 'O circuito precisa de válvula de alívio; óleo contaminado risca a câmara e os mancais.',
    labId: 'gear-pump',
    microId: 'tec-bomba-tipos'
  },
  {
    id: 'engrenagens-internas',
    name: 'Bomba de engrenagens internas',
    family: 'rotativa',
    principle: 'Uma engrenagem menor gira dentro de uma engrenagem com dentes internos; o espaço entre elas abre na entrada e fecha na saída.',
    usedFor: 'Hidráulica e transferência de líquidos viscosos.',
    care: 'Também é de deslocamento positivo: exige proteção contra sobrepressão no circuito.'
  },
  {
    id: 'palhetas',
    name: 'Bomba de palhetas',
    family: 'rotativa',
    principle: 'Um rotor com palhetas deslizantes gira fora de centro dentro de um anel; as câmaras entre as palhetas aumentam na entrada e diminuem na saída.',
    usedFor: 'Hidráulica industrial e móbil, transferência de combustíveis e óleos.',
    care: 'Palhetas e anel gastam com contaminação; o sentido de giro costuma ser definido pelo projeto.'
  },
  {
    id: 'pistoes',
    name: 'Bomba de pistões',
    family: 'alternativa',
    principle: 'Pistões se movem em cilindros: aspiram o líquido num sentido e o empurram no outro. Há versões axiais, radiais e em linha.',
    usedFor: 'Hidráulica de alta pressão, dosagem, limpeza com alta pressão.',
    care: 'Muito sensível à limpeza do óleo; respeitar a pressão máxima e os ajustes do fabricante.'
  },
  {
    id: 'parafusos',
    name: 'Bomba de parafusos (fusos)',
    family: 'rotativa',
    principle: 'Fusos com rosca engrenam entre si e formam câmaras que avançam ao longo do eixo, levando o líquido com pouca pulsação.',
    usedFor: 'Óleos combustíveis, lubrificação de turbinas e grandes máquinas, líquidos viscosos.',
    care: 'Não operar a seco; a folga entre fusos e carcaça define o rendimento.'
  },
  {
    id: 'diafragma',
    name: 'Bomba de diafragma',
    family: 'alternativa',
    principle: 'Uma membrana flexível vai e volta, com válvulas de retenção na entrada e na saída. O líquido não toca nas partes móveis do acionamento.',
    usedFor: 'Produtos químicos, dosagem, líquidos abrasivos ou com sólidos (versões pneumáticas).',
    care: 'Membrana e válvulas são peças de desgaste; verifique a compatibilidade do material com o produto.',
    labId: 'diaphragm-pump'
  },
  {
    id: 'lobulos',
    name: 'Bomba de lóbulos',
    family: 'rotativa',
    principle: 'Dois rotores com lóbulos giram sincronizados por engrenagens externas, sem encostar um no outro, levando o líquido pela periferia.',
    usedFor: 'Alimentos, cosméticos e produtos sensíveis ao cisalhamento.',
    care: 'A sincronização é feita por engrenagens: se elas gastam, os lóbulos podem se tocar.'
  }
];
