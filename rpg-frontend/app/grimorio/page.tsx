"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";
import { useNotification } from "../../components/contexts/NotificationContext";
import HabilidadeCard from "../../components/HabilidadeCard"; 

// --- DADOS COMPLETOS E DETALHADOS (BASEADOS NO DOC) ---
const TEXTOS_ELEMENTAL_AR: Record<string, any> = {
  "Sob Pressão": {
    tag: "Controle",
    descricaoGeral: "O usuário comprime o ar ao seu redor, tornando-o denso e opressivo como uma maré invisível. Cada movimento exige esforço extremo, os músculos ardem e a respiração se torna pesada. O campo reconhece aliados, afetando apenas inimigos.",
    observacoes: "• Foco Único: Se focar em apenas 1 alvo, a dificuldade é DOBRADA.\n• Área: Se afetar >3 alvos, a dificuldade cai pela METADE.\n• Não causa dano direto, apenas exaustão e colapso.",
    niveis: {
      1: {
        titulo: "Compressão Inicial",
        detalhes: "O ar ao redor dos alvos se torna visivelmente denso, dificultando movimentos básicos.\n• Adicione 1D10 de dificuldade em toda ação física do alvo.\n• Ações físicas sofrem penalidades claras, como lentidão, perda de equilíbrio e fadiga acelerada.\n• Corridas, saltos e ataques rápidos tornam-se imprecisos e custosos.\n• Duração: 1D6 de turnos.",
        resumo: "Dificuldade +1D10. Movimentos imprecisos e fadiga acelerada."
      },
      2: {
        titulo: "Atmosfera Opressiva",
        detalhes: "A pressão aumenta a ponto de afetar respiração, postura e resistência muscular.\n• Adicione 1D20 de dificuldade em toda ação física do alvo.\n• Ações físicas exigem grande esforço contínuo, tornando sequências de ataques quase impossíveis.\n• Alvos mais fracos podem ser forçados a ajoelhar ou reduzir drasticamente sua mobilidade.\n• Duração: 1D8 de turnos.",
        resumo: "Dificuldade +1D20. Sequências de ataques tornam-se impossíveis."
      },
      3: {
        titulo: "Colapso Atmosférico",
        detalhes: "O ar se comprime como uma parede invisível, esmagando o corpo contra o próprio peso.\n• Adicione 2D20 de dificuldade em toda ação física do alvo.\n• Movimentos físicos tornam-se extremamente limitados, e ações complexas podem falhar automaticamente.\n• Alvos presos por tempo prolongado podem sofrer colapsos respiratórios.\n• Duração: 1D10 de turnos.",
        resumo: "Dificuldade +2D20. Colapso respiratório e falha em ações complexas."
      },
      4: {
        titulo: "Ω Gravidade Hostil",
        detalhes: "A pressão deixa de agir apenas como resistência e passa a puxar o corpo contra o chão, reescrevendo a gravidade localmente.\n• Adicione 3D20 de dificuldade em toda ação física do alvo.\n• Manter-se em pé exige esforço constante; deslocamentos consomem múltiplas ações.\n• Ações rápidas ou acrobáticas falham automaticamente.\n• Duração: 1D12 turnos.",
        resumo: "Dificuldade +3D20. Gravidade reescrita, ações rápidas falham automaticamente."
      },
      5: {
        titulo: "Ω Zona de Esmagamento",
        detalhes: "O ar se torna um meio sólido, comprimindo músculos, ossos e órgãos internos.\n• Adicione 4D20 de dificuldade em toda ação física do alvo.\n• A maioria das ações físicas se torna inviável; apenas movimentos mínimos são possíveis.\n• Falhas consecutivas podem resultar em asfixia ou danos internos.\n• Duração: 1D12 + 1D6 turnos.",
        resumo: "Dificuldade +4D20. O ar se torna sólido, causando asfixia e danos internos."
      },
      6: {
        titulo: "Ω Pressão Absoluta",
        detalhes: "O ar colapsa sobre si mesmo, criando um domínio onde o corpo não foi feito para existir.\n• Adicione 5D20 de dificuldade em toda ação física do alvo.\n• Qualquer movimento exige sucesso narrativo extremo; falhas resultam em colapso imediato.\n• O alvo é forçado ao chão, incapaz de se levantar.\n• Duração: 2D10 turnos.",
        resumo: "Dificuldade +5D20. Colapso total do corpo e imobilidade absoluta."
      }
    }
  },
  "Repulsão": {
    tag: "Defesa",
    descricaoGeral: "O usuário libera uma rajada concentrada de força cinética em uma única direção. O impacto arremessa corpos, rompe formações e distorce o equilíbrio. A rajada sempre segue uma linha reta.",
    observacoes: "• Direcional: Segue sempre uma linha reta definida na ativação.\n• Colisão: Quanto maior o deslocamento, maior o dano narrativo de impacto contra paredes.",
    niveis: {
      1: {
        titulo: "Impacto Repelente",
        detalhes: "Uma rajada curta e violenta é disparada à frente.\n• O alvo precisa superar 20 em Resistência para não ser afetado.\n• Inimigos são empurrados e perdem o equilíbrio.\n• Alvos leves podem ser derrubados.\n• Não afeta projéteis mágicos.",
        resumo: "Resistência 20. Empurrão curto que desequilibra inimigos."
      },
      2: {
        titulo: "Arremesso Violento",
        detalhes: "A rajada ganha intensidade suficiente para erguer inimigos do chão.\n• O alvo precisa superar 35 em Resistência.\n• Alvos são lançados ao ar antes de cair.\n• Quebra formações defensivas.\n• Tira brevemente inimigos leves do chão.",
        resumo: "Resistência 35. Lança inimigos ao ar e quebra formações."
      },
      3: {
        titulo: "Ejeção Brutal",
        detalhes: "A força liberada se torna explosiva e quase incontrolável.\n• O alvo precisa superar 50 em Resistência.\n• Inimigos são violentamente arremessados, podendo colidir com estruturas.\n• Alvos leves são lançados a grandes distâncias.",
        resumo: "Resistência 50. Arremesso violento com risco de colisão."
      },
      4: {
        titulo: "Ω Onda de Deslocamento",
        detalhes: "A rajada se amplia e se torna uma maré cinética contínua.\n• O alvo precisa superar 65 em Resistência.\n• Inimigos perdem controle total do corpo durante o deslocamento.\n• Desvia projéteis físicos médios.\n• Remove inimigos do chão de forma prolongada.",
        resumo: "Resistência 65. Maré cinética que desvia projéteis físicos."
      },
      5: {
        titulo: "Ω Linha de Expulsão",
        detalhes: "Cria uma linha de exclusão que rejeita qualquer presença.\n• O alvo precisa superar 80 em Resistência.\n• Inimigos são lançados para fora de áreas de combate ou plataformas.\n• Interrompe investidas e cargas.\n• Alvos médios são tratados como projéteis improvisados.",
        resumo: "Resistência 80. Expulsa inimigos do mapa e interrompe cargas."
      },
      6: {
        titulo: "Ω Repulsão Absoluta",
        detalhes: "Força cinética que nega o direito de permanência na linha de ação.\n• O alvo precisa superar 100 em Resistência.\n• Expulsão até o limite narrativo definido pelo mestre.\n• Criaturas leves/médias são arrastadas automaticamente sem teste.\n• Desvia ou dissipa projéteis físicos e energéticos não mágicos.",
        resumo: "Resistência 100. Nega permanência e dissipa projéteis não mágicos."
      }
    }
  },
  "Autodomínio": {
    tag: "Combate",
    descricaoGeral: "O usuário utiliza o controle absoluto do ar para envolver equipamentos em correntes invisíveis de pressão e fluxo. Armas e objetos passam a orbitar seu corpo ou obedecer comandos à distância como extensões da vontade.",
    observacoes: "• Custo Mental: Controlar muitos itens exige concentração extrema.\n• Interrupção: Se o usuário sofrer dano grave, os itens caem.\n• Não cria armas, apenas controla as existentes.",
    niveis: {
      1: {
        titulo: "Órbita Controlada",
        detalhes: "Pode controlar apenas 1 equipamento.\n• O item gira de forma estável.\n• Permite ataques simples e bloqueios improvisados.\n• Duração: 1D12 turnos.",
        resumo: "Controla 1 arma. Ataques simples e estáveis."
      },
      2: {
        titulo: "Conduta Direcionada",
        detalhes: "Pode controlar até 3 equipamentos.\n• Itens podem ser lançados e recolhidos.\n• Ataques múltiplos em sequência tornam-se possíveis.\n• Duração: 1D10 turnos.",
        resumo: "Controla 3 armas. Pode lançar e recolher itens."
      },
      3: {
        titulo: "Maestria Atmosférica",
        detalhes: "Pode controlar até 6 equipamentos.\n• Movimento errático e imprevisível, atacando de múltiplos ângulos.\n• Pode manter órbita defensiva enquanto ataca.\n• Duração: 1D8 turnos.",
        resumo: "Controla 6 armas. Movimentos imprevisíveis e complexos."
      },
      4: {
        titulo: "Ω Coreografia de Pressão",
        detalhes: "Pode controlar até 10 equipamentos.\n• Movimento em padrões coreografados com defesa automática.\n• Intercepta golpes físicos direcionados ao usuário.\n• Duração: 1D6 turnos.",
        resumo: "Controla 10 armas. Defesa automática e padrões independentes."
      },
      5: {
        titulo: "Ω Campo de Autoridade",
        detalhes: "Controla até 15 equipamentos num raio próximo.\n• Armas reagem à intenção, prendendo membros ou rotas de fuga.\n• Mantém pressão constante sobre inimigos.\n• Duração: 1D6 turnos.",
        resumo: "Controla 15 armas. Reação instintiva e controle de área."
      },
      6: {
        titulo: "Ω Soberania do Fluxo",
        detalhes: "Controla até 20 equipamentos.\n• O ar é extensão da vontade; armas não podem ser desarmadas.\n• Pode suspender equipamentos inimigos próximos temporariamente.\n• O campo de batalha se torna hostil à aproximação.\n• Duração: 1D6 turnos.",
        resumo: "Controla 20 armas. Imunidade a desarme e controle total."
      }
    }
  },
  "Grito Bárbaro": {
    tag: "Tanque",
    descricaoGeral: "O usuário compacta o ar ao redor do corpo, formando uma couraça pesada que reduz drasticamente o dano físico em troca de mobilidade e velocidade.",
    observacoes: "• Penalidade: Reduz mobilidade e Destreza conforme a resistência aumenta.\n• Psicológico: Não protege contra magias mentais ou dano interno.\n• Intimidação: Aumenta a presença opressora no campo.",
    niveis: {
      1: {
        titulo: "Endurecimento Inicial",
        detalhes: "A resistência física aumenta contra impactos diretos.\n• Adicione +1D10 em Resistência.\n• Penalidade: -1D6 em ações de Destreza.\n• Golpes contundentes têm efeitos reduzidos.",
        resumo: "+1D10 Res / -1D6 Des. Reduz impactos leves."
      },
      2: {
        titulo: "Corpo de Aço",
        detalhes: "Permite suportar golpes pesados sem recuar.\n• Adicione +1D20 em Resistência.\n• Penalidade: -2D6 em ações de Destreza.\n• O corpo raramente perde o equilíbrio.",
        resumo: "+1D20 Res / -2D6 Des. Suporta golpes pesados sem recuar."
      },
      3: {
        titulo: "Massa Inabalável",
        detalhes: "Corpo quase impenetrável a impactos físicos.\n• Adicione +1D20 + 1D10 em Resistência.\n• Penalidade: -3D8 em ações de Destreza.\n• Usuário torna-se lento, porém inevitável.",
        resumo: "+1D20+1D10 Res / -3D8 Des. Quase impenetrável."
      },
      4: {
        titulo: "Ω Colosso de Compressão",
        detalhes: "O corpo funciona como um bloco único.\n• Adicione +2D20 em Resistência.\n• Penalidade: -4D8 em ações de Destreza.\n• Empurrões e tentativas de derrubar falham automaticamente.",
        resumo: "+2D20 Res / -4D8 Des. Imune a empurrões comuns."
      },
      5: {
        titulo: "Ω Âncora do Mundo",
        detalhes: "Ponto fixo no espaço, não pode ser movido à força.\n• Adicione +3D20 em Resistência.\n• Penalidade: -5D10 em ações de Destreza.\n• Golpes físicos causam dano mínimo narrativo.",
        resumo: "+3D20 Res / -5D10 Des. Imovível e anula dano físico comum."
      },
      6: {
        titulo: "Ω Monumento Vivo",
        detalhes: "O usuário é tratado como estrutura colossal.\n• Adicione +5D20 em Resistência.\n• Penalidade: -6D12 em ações de Destreza.\n• Ataques físicos diretos são anulados narrativamente.",
        resumo: "+5D20 Res / -6D12 Des. Estrutura colossal, anula ataques físicos."
      }
    }
  },
  "Voo": {
    tag: "Mobilidade",
    descricaoGeral: "O usuário manipula correntes de ar ao redor do próprio corpo, criando zonas de sustentação instáveis que desafiam a gravidade. O deslocamento exige foco constante e leitura do ambiente.",
    observacoes: "• Carga: Não pode carregar aliados (exceto Nível 4+).\n• Clima: Ventos fortes ou tempestades dificultam o controle.\n• Altitude: Quanto mais alto, menor a duração.",
    niveis: {
      1: {
        titulo: "Planar Instintivo",
        detalhes: "Permite planar de grandes alturas com segurança.\n• Pode se erguer brevemente do solo.\n• Duração: 1D4 turnos.\n• Qualquer dano encerra o efeito.",
        resumo: "Planar e pequenos saltos por 1D4 turnos."
      },
      2: {
        titulo: "Sustentação Dirigida",
        detalhes: "Voo controlado a médias alturas.\n• Pode mudar de direção e desacelerar quedas.\n• Duração: 1D8 turnos.\n• Alta concentração exigida.",
        resumo: "Voo médio controlado por 1D8 turnos."
      },
      3: {
        titulo: "Ascensão Precária",
        detalhes: "Levantar voo a grandes alturas.\n• Manobras precisas e curvas fechadas.\n• Duração: 1D20 turnos.\n• Perda de foco causa queda imediata.",
        resumo: "Grandes alturas e manobras por 1D20 turnos."
      },
      4: {
        titulo: "Ω Suspensão Forçada",
        detalhes: "Zonas de ar comprimido agressivas.\n• Voo agressivo com mergulhos e freadas súbitas.\n• Duração: 1D20 + 1D10 turnos.\n• Presença aérea causa desconforto narrativo.",
        resumo: "Voo agressivo e mergulhos por 1D20+1D10 turnos."
      },
      5: {
        titulo: "Ω Desafio à Gravidade",
        detalhes: "Enfrenta a gravidade ativamente.\n• Voo mantido mesmo em altitudes extremas.\n• Duração: 2D20 turnos.\n• O corpo sofre micro tensões após o uso.",
        resumo: "Enfrenta gravidade por 2D20 turnos. Causa exaustão."
      },
      6: {
        titulo: "Ω Céu Inóspito",
        detalhes: "O ar é moldado à força; o usuário é uma anomalia no céu.\n• Altitudes extremas.\n• Duração: 1D100 turnos.\n• Voo deixa de ser fluido e vira ato de controle absoluto.",
        resumo: "Voo quase ilimitado (1D100 turnos) em altitudes extremas."
      }
    }
  },
  "Frenesi": {
    tag: "Foco",
    descricaoGeral: "Ao escolher um inimigo como foco, o usuário entra em um estado de concentração predatória. O mundo se estreita até restar apenas o alvo. Dor, cansaço e distrações são empurrados para o fundo da mente. Cada movimento, cada decisão e cada impulso são moldados pelo instinto de eliminar aquela única ameaça. O Frenesi não busca vitória elegante — ele só termina com o fim do alvo.",
    observacoes: "• Alvo Único: Não pode trocar de alvo enquanto ativo.\n• Cego: Não distingue aliados de inimigos se entrarem no caminho.\n• Imunidade: Imune a medo e charme, mas vulnerável a ilusões.",
    niveis: {
      1: {
        titulo: "Foco Sangrento",
        detalhes: "Foco em um inimigo visível.\n• Ganha +1D20 em um Talento ligado a ações contra o alvo.\n• Duração: 1D6 turnos.\n• Ignora distrações menores.",
        resumo: "+1D20 contra o alvo. Duração 1D6."
      },
      2: {
        titulo: "Obsessão Predatória",
        detalhes: "Vínculo mental intensificado.\n• Ganha +2D20 em ações contra o alvo.\n• Duração: 1D12 turnos.\n• Ignora dor leve e ferimentos superficiais.",
        resumo: "+2D20 contra o alvo. Ignora dor leve."
      },
      3: {
        titulo: "Caçada Irreversível",
        detalhes: "Anula possibilidade de recuo voluntário.\n• Ganha +3D20 pontos em um Talento à sua escolha, voltado à eliminação do alvo.\n• Duração: 1D20 turnos.\n• Não pode desistir ou agir defensivamente.",
        resumo: "+3D20 contra o alvo. Não pode recuar."
      },
      4: {
        titulo: "Ω Êxtase de Combate",
        detalhes: "Percepção de dor severamente reduzida.\n• Ganha +4D20 em qualquer Talento (adaptável).\n• Ferimentos médios ignorados.\n• Decisões tornam-se impulsivas.",
        resumo: "+4D20 em qualquer talento. Ignora ferimentos médios."
      },
      5: {
        titulo: "Ω Colapso Funcional",
        detalhes: "O corpo ignora limites biológicos (ossos, músculos).\n• Ganha +5D20 em qualquer Talento.\n• Penalidade de 2D20 para defesas e esquivas.\n• Pode sofrer desmaio ao final.",
        resumo: "+5D20. Corpo ignora limites, mas perde defesa."
      },
      6: {
        titulo: "Ω Frenesi Absoluto",
        detalhes: "Abandona autopreservação; opera além do sustentável.\n• Ganha +6D20 em qualquer Talento.\n• Dor, medo e cansaço suprimidos.\n• Perda de memória recente após o uso.",
        resumo: "+6D20. Sem autopreservação. Perda de memória pós-uso."
      }
    }
  },
  "Cutilada": {
    tag: "Ataque",
    descricaoGeral: "Alice condensa o ar em filetes extremamente comprimidos, criando lâminas invisíveis de alta pressão. Essas lâminas rasgam o espaço à frente e podem ter direção ajustada.",
    observacoes: "• Invisível: Requer teste de Investigação para ser percebida.\n• Mental: Maior precisão custa mais sanidade/foco.\n• Ambiente: Ar rarefeito ou vácuo enfraquecem a magia.",
    niveis: {
      1: {
        titulo: "Fio de Vento",
        detalhes: "Lâmina simples disparada em linha reta.\n• Cortes superficiais a moderados.\n• Perde coesão após impacto.\n• Inimigos precisam superar 15 em Investigação para perceber.",
        resumo: "Lâmina reta simples. Investigação 15 para ver."
      },
      2: {
        titulo: "Corte Direcionado",
        detalhes: "Lâmina mais estável e afiada.\n• Permite pequenos ajustes de direção.\n• Atravessa armaduras leves.\n• Investigação 30 para perceber.",
        resumo: "Lâmina guiada. Atravessa armaduras leves."
      },
      3: {
        titulo: "Filetes Múltiplos",
        detalhes: "Cria 1D4 cutiladas simultâneas.\n• Lâminas mais finas e cortantes.\n• Permite varrer áreas.\n• Custo físico aumenta (sangramento nasal).\n• Investigação 50 para perceber.",
        resumo: "1D4 Lâminas. Varre áreas. Custo físico maior."
      },
      4: {
        titulo: "Ω Lâmina Maleável",
        detalhes: "Cria até 1D8 lâminas moldáveis em tempo real.\n• Altera tamanho, curvatura e trajetória.\n• Pode contornar obstáculos e escudos.\n• Investigação 65 para perceber.",
        resumo: "1D8 Lâminas controláveis. Contorna obstáculos."
      },
      5: {
        titulo: "Ω Dilacerar",
        detalhes: "Gera até 1D10 lâminas com pressão sonora.\n• Atravessa múltiplos alvos e estruturas.\n• Impacto gera ondas secundárias de corte.\n• Investigação 80 para perceber.",
        resumo: "1D10 Lâminas. Atravessa estruturas e emite som."
      },
      6: {
        titulo: "Ω Campo de Mutilação",
        detalhes: "Gera até 1D12 lâminas num campo instável.\n• Lâminas nascem e morrem ao redor da vontade do usuário.\n• Ataques simultâneos em todas as direções.\n• Exaustão severa após uso.\n• Investigação 100 para perceber.",
        resumo: "1D12 Lâminas onipresentes. Campo de corte absoluto."
      }
    }
  },
  "Monastério": {
    tag: "Mental",
    descricaoGeral: "O usuário manifesta no mundo exterior o espaço que habita seu subconsciente: um campo vasto com uma árvore ao centro. Dentro dele, os sentidos são alterados e magias mentais desestabilizadas.",
    observacoes: "• Emocional: Se o usuário se desestabilizar, o campo falha.\n• Sem Dano: A habilidade é puramente sensorial e psicológica.\n• Recorrência: Uso excessivo pode causar traumas no usuário.",
    niveis: {
      1: {
        titulo: "Espaço de Quietude",
        detalhes: "Campo pequeno ao redor de um alvo.\n• Inimigos: -1D10 em Consciência/Autocontrole.\n• Aliados: Bônus contra medo.\n• Duração: 1D6 turnos.",
        resumo: "Inimigos -1D10 Consciência. Aliados resistem a medo."
      },
      2: {
        titulo: "Campo de Oração",
        detalhes: "Campo expandido em raio narrativo.\n• Inimigos: -2D10 em Consciência/Autocontrole.\n• Aliados: Recuperam clareza mental.\n• Magias mentais em aliados enfraquecem.\n• Duração: 1D10 turnos.",
        resumo: "Inimigos -2D10. Aliados recuperam clareza."
      },
      3: {
        titulo: "Presença Central",
        detalhes: "Árvore visível ao centro; desconforto psicológico em inimigos.\n• Inimigos: -1D20 + 1D10 em testes mentais ofensivos.\n• Magias mentais médias em aliados são quebradas.\n• Duração: 1D10 + 1D6 turnos.",
        resumo: "Inimigos -1D20+1D10. Quebra magias mentais médias."
      },
      4: {
        titulo: "Ω Domínio dos Sentidos",
        detalhes: "Controla estímulos sensoriais.\n• Suprime sentidos específicos do inimigo.\n• Inimigos: -2D20 em Consciência.\n• Aliados resistentes a ilusões.\n• Duração: 1D20 turnos.",
        resumo: "Inimigos -2D20. Suprime sentidos e resiste a ilusões."
      },
      5: {
        titulo: "Ω Santuário da Mente",
        detalhes: "Magias mentais inimigas entram em colapso.\n• Inimigos: -2D20 + 1D10 em Consciência.\n• Dominação mental falha automaticamente em aliados.\n• Sensação de isolamento nos inimigos.\n• Duração: 1D20 + 1D10 turnos.",
        resumo: "Inimigos -2D20+1D10. Imunidade a dominação em aliados."
      },
      6: {
        titulo: "Ω Monastério Interior",
        detalhes: "Realidade imposta; mundo exterior parece irrelevante.\n• Inimigos: -3D20 em Consciência (Sobrecarga ou Vazio).\n• Anula instantaneamente magia mental hostil.\n• Duração: 2D20 turnos.",
        resumo: "Inimigos -3D20. Anula qualquer magia mental hostil."
      }
    }
  }
};

const PASSIVAS_ELEMENTAL = [
  { nome: "Presença", tag: "Passiva", descricao: "Sente tudo que toca o ar ao redor. Percepção espacial contínua." },
  { nome: "Breve Flora", tag: "Passiva", descricao: "Magias ofensivas de Natureza falham contra você." },
  { nome: "Teleporte através de Símbolo", tag: "Híbrido", descricao: "Teleporte instantâneo entre símbolos gêmeos. Sem teste." }
];

export default function GrimorioPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  
  const [magiasBackend, setMagiasBackend] = useState<any[]>([]);
  const [magiaSelecionada, setMagiaSelecionada] = useState<any>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { router.push("/login"); return; }
      try {
        const resChar = await fetch("http://127.0.0.1:5000/meu-personagem", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }),
        });
        if (resChar.status === 200) {
          const charData = await resChar.json();
          setPersonagem(charData);
          const resGrimorio = await fetch(`http://127.0.0.1:5000/meu-grimorio/${charData.id}`);
          if (resGrimorio.ok) {
              setMagiasBackend(await resGrimorio.json());
          }
        }
      } catch (error) { console.error(error); }
      setLoading(false);
  }

  async function uparMagia(nomeMagia: string) {
    if (!personagem) return;
    const magiaAtual = magiasBackend.find(m => m.nome === nomeMagia);
    if (magiaAtual && magiaAtual.nivel >= 6) {
        showNotification("Nível máximo (Ω) alcançado!", "erro");
        return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:5000/habilidades/${personagem.id}/${nomeMagia}`, { method: "PUT" });
      if (res.status === 200 || res.status === 201) {
        showNotification(`✨ ${nomeMagia} evoluiu!`, "sucesso");
        carregarDados();
        setMagiaSelecionada(null); 
      } else {
        const data = await res.json();
        showNotification(data.erro || "Erro.", "erro");
      }
    } catch (error) { showNotification("Erro de conexão.", "erro"); }
  }

  function abrirDetalhes(nomeMagia: string, infoBase: any, nivelAtual: number) {
      // Prepara os dados para o modal
      let dadosNivelAtual = null;
      let resumoProximo = "Nível Máximo (Ω).";

      // Pega dados do nível atual (se aprendido)
      if (nivelAtual > 0) {
          dadosNivelAtual = infoBase.niveis[nivelAtual];
      }

      // Pega resumo do próximo nível
      if (nivelAtual < 6) {
          resumoProximo = infoBase.niveis[nivelAtual + 1].resumo;
      }

      setMagiaSelecionada({
          nome: nomeMagia,
          info: infoBase,
          nivel: nivelAtual,
          dadosAtual: dadosNivelAtual,
          resumoProximo: resumoProximo
      });
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} flex items-center justify-center ${theme.text} font-mono text-2xl animate-pulse`}>Sintonizando Magia...</div>;
  const isElementalAr = personagem?.classe === "Elemental do Ar";

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6 w-full relative z-10">
        
        {/* HEADER */}
        <div className={`flex justify-between items-center mb-8 border-b ${theme.border} pb-4 ${theme.panel} px-6 py-4 rounded-xl shadow-lg`}>
          <div className="flex items-center gap-6">
             <button onClick={() => router.push("/ficha")} className={`group flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors px-3 py-2 rounded-lg hover:bg-white/5`}>
                <span className="text-sm font-bold uppercase tracking-wider">← Voltar</span>
             </button>
             <div>
                <h1 className={`text-3xl font-black uppercase tracking-wide ${theme.primary}`}>
                    {isElementalAr ? "Grimório do Ar" : "Grimório Arcano"}
                </h1>
                <p className="text-xs opacity-60 font-mono uppercase tracking-widest mt-1">
                    PORTADOR: <span className="font-bold">{personagem?.nome}</span>
                </p>
             </div>
          </div>
        </div>

        {isElementalAr ? (
            <div className="space-y-12">
                {/* ATIVAS */}
                <div>
                    <h2 className={`text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <span className="text-2xl">⚡</span> Habilidades Ativas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(TEXTOS_ELEMENTAL_AR).map(([nomeMagia, info]) => {
                            const magiaNoBanco = magiasBackend.find(m => m.nome === nomeMagia);
                            const nivelAtual = magiaNoBanco ? magiaNoBanco.nivel : 0;
                            // Texto para o CARD (Usa o resumo para não ficar gigante)
                            const textoCard = nivelAtual > 0 ? info.niveis[nivelAtual].resumo : "Habilidade Latente. Clique para detalhes.";

                            return (
                                <div key={nomeMagia} className="h-full cursor-pointer" onClick={() => abrirDetalhes(nomeMagia, info, nivelAtual)}>
                                    <HabilidadeCard 
                                        nome={nomeMagia}
                                        nivel={nivelAtual}
                                        descricao={textoCard}
                                        tag={info.tag}
                                        podeEvoluir={true} 
                                        onEvolve={() => abrirDetalhes(nomeMagia, info, nivelAtual)} 
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PASSIVAS */}
                <div>
                    <h2 className={`text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <span className="text-2xl">✨</span> Passivas & Híbridas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PASSIVAS_ELEMENTAL.map((passiva) => (
                            <div key={passiva.nome} className="h-full">
                                <HabilidadeCard 
                                    nome={passiva.nome} nivel={0} descricao={passiva.descricao} tag={passiva.tag} podeEvoluir={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Lógica para outras classes se necessário */}
                 <p className="opacity-50">Carregando grimório padrão...</p>
            </div>
        )}
      </div>

      {/* --- MODAL DETALHADO (VERSÃO FINAL) --- */}
      {magiaSelecionada && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in" onClick={() => setMagiaSelecionada(null)}>
            <div className={`${theme.panel} p-0 rounded-2xl max-w-2xl w-full border border-white/20 shadow-2xl relative overflow-hidden`} onClick={(e) => e.stopPropagation()}>
                
                {/* TOPO */}
                <div className={`bg-gradient-to-r ${theme.button} p-6 flex justify-between items-center`}>
                    <div>
                        <h2 className="text-3xl font-black uppercase text-white tracking-widest">{magiaSelecionada.nome}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 bg-black/20 px-2 py-1 rounded mt-1 inline-block">{magiaSelecionada.info.tag}</span>
                    </div>
                    <div className="bg-black/30 px-4 py-2 rounded-lg text-white font-mono font-bold text-2xl border border-white/20">
                        LVL {magiaSelecionada.nivel}
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* 1. CONCEITO */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 opacity-50 flex items-center gap-2 ${theme.text}`}>
                            <span>📖</span> Conceito & Descrição
                        </h3>
                        <p className={`text-sm leading-relaxed opacity-90 text-justify ${theme.text}`}>
                            {magiaSelecionada.info.descricaoGeral}
                        </p>
                    </div>

                    {/* 2. EFEITO ATUAL (DETALHADO) */}
                    <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.primary} flex items-center gap-2`}>
                                <span>⚡</span> Efeito Atual (Nível {magiaSelecionada.nivel})
                            </h3>
                            {magiaSelecionada.dadosAtual && (
                                <span className="text-[10px] uppercase font-bold opacity-50 tracking-widest border border-current px-2 rounded">
                                    {magiaSelecionada.dadosAtual.titulo}
                                </span>
                            )}
                        </div>
                        
                        <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap opacity-90 ${theme.text}`}>
                            {magiaSelecionada.nivel > 0 
                                ? magiaSelecionada.dadosAtual.detalhes 
                                : <span className="italic opacity-50">Esta habilidade ainda não foi despertada. Clique em aprender para iniciar.</span>}
                        </div>
                    </div>

                    {/* 3. REGRAS & OBSERVAÇÕES */}
                    {magiaSelecionada.info.observacoes && (
                        <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-yellow-500/80 flex items-center gap-2">
                                <span>⚠️</span> Regras & Observações
                            </h3>
                            <p className={`text-xs opacity-70 whitespace-pre-wrap leading-relaxed font-mono ${theme.text}`}>
                                {magiaSelecionada.info.observacoes}
                            </p>
                        </div>
                    )}

                    {/* 4. PREVISÃO PRÓXIMO NÍVEL (BREVE) */}
                    {magiaSelecionada.nivel < 6 && (
                        <div className="border-t border-white/5 pt-4 opacity-70 hover:opacity-100 transition-opacity">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-green-400 flex items-center gap-2">
                                <span>🔮</span> Próximo Nível (Lvl {magiaSelecionada.nivel + 1})
                            </h3>
                            <p className="text-sm font-serif italic text-white/60">
                                "{magiaSelecionada.resumoProximo}"
                            </p>
                        </div>
                    )}

                </div>

                {/* RODAPÉ */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                    <button onClick={() => setMagiaSelecionada(null)} className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">Fechar</button>
                    {magiaSelecionada.nivel < 6 && (
                        <button 
                            onClick={() => uparMagia(magiaSelecionada.nome)} 
                            className={`px-8 py-3 rounded-lg font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-green-600 to-emerald-600 text-white`}
                        >
                            {magiaSelecionada.nivel === 0 ? "APRENDER" : "EVOLUIR"}
                        </button>
                    )}
                </div>

            </div>
        </div>
      )}

    </PageWrapper>
  );
}