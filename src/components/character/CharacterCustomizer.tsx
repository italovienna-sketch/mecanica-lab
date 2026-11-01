import { SettingsPanel } from './SettingsPanel';
import React, { useEffect, useRef, useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { 
  RotateCcw, 
  Shuffle, 
  ArrowRight, 
  ShieldCheck, 
  HardHat, 
  Glasses, 
  Headphones,
  Sparkles,
  Palette,
  User,
  Shirt,
  Smile
} from 'lucide-react';
import { AvatarCustomization } from '../../types/game';
import { CharacterAvatarSvg } from '../CharacterAvatarSvg';
import { Page, PageHeader } from '../ui';
import { PPE_LABEL, ROOMS_BY_ID, missingPpe, ppeFix } from '../../game/campusLayout';

export const CharacterCustomizer: React.FC = () => {
  const {
    playerProfile,
    updatePlayerName,
    updateCustomization,
    randomizeCustomization,
    resetCustomization,
    navigateTo
  } = useGameState();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [localName, setLocalName] = useState(playerProfile.name);
  const [activeCategory, setActiveCategory] = useState<'presets' | 'face' | 'hair_makeup' | 'clothing' | 'epi'>('presets');
  const custom = playerProfile.customization;

  const stylePresets: {
    id: AvatarCustomization['stylePreset'];
    label: string;
    desc: string;
    patch: Partial<AvatarCustomization>;
  }[] = [
    {
      id: 'escola_tradicional',
      label: 'Aprendiz de escola técnica',
      desc: 'Camiseta branca técnica com gola azul, calça jeans, tênis e crachá',
      patch: {
        stylePreset: 'escola_tradicional',
        uniformType: 'aluno_tecnico',
        uniformColor: '#f8fafc',
        trousersColor: '#1d4ed8',
        shoeStyle: 'tenis_escolar',
        shoeColor: '#111827',
        helmetType: 'capacete_epi',
        helmetColor: '#eab308',
        makeupStyle: 'nenhuma',
        accessoryType: 'cracha_escolar',
        hasSafetyGlasses: true,
        hasEarMuffs: true
      }
    },
    {
      id: 'gotico_alternativo',
      label: 'Gótico / alternativo',
      desc: 'Jaqueta preta estruturada, delineado marcante, batom escuro, coturno e colar',
      patch: {
        stylePreset: 'gotico_alternativo',
        uniformType: 'jaqueta_gotica',
        uniformColor: '#18181b',
        trousersColor: '#09090b',
        shoeStyle: 'coturno_alt',
        shoeColor: '#09090b',
        hairStyle: 'franja_alt',
        hairColor: '#09090b',
        makeupStyle: 'gotico_marcante',
        lipstickColor: '#4c0519',
        helmetType: 'sem_capacete',
        accessoryType: 'colar_alt',
        hasSafetyGlasses: true,
        hasEarMuffs: false
      }
    },
    {
      id: 'colorido_criativo',
      label: 'Colorido e expressivo',
      desc: 'Cabelo vibrante, sombra artística, moletom estilizado e óculos de proteção',
      patch: {
        stylePreset: 'colorido_criativo',
        uniformType: 'moletom_casual',
        uniformColor: '#7c3aed',
        trousersColor: '#1e293b',
        shoeStyle: 'tenis_escolar',
        shoeColor: '#ec4899',
        hairStyle: 'cacheado',
        hairColor: '#db2777',
        makeupStyle: 'sombra_colorida',
        lipstickColor: '#e11d48',
        helmetType: 'bone_oficina',
        helmetColor: '#06b6d4',
        accessoryType: 'relogio_tecnico',
        hasSafetyGlasses: true
      }
    },
    {
      id: 'casual_urbano',
      label: 'Casual confortável',
      desc: 'Moletom cinza urbano, calça jeans escura, delineado sutil e tênis',
      patch: {
        stylePreset: 'casual_urbano',
        uniformType: 'moletom_casual',
        uniformColor: '#334155',
        trousersColor: '#1e3a8a',
        shoeStyle: 'tenis_escolar',
        shoeColor: '#f8fafc',
        hairStyle: 'longo_solto',
        makeupStyle: 'delineado_sutil',
        lipstickColor: '#be185d',
        helmetType: 'sem_capacete',
        accessoryType: 'relogio_tecnico'
      }
    },
    {
      id: 'industrial_pesado',
      label: 'Manutenção pesada',
      desc: 'Macacão laranja de alta visibilidade com faixas refletivas e bota composite',
      patch: {
        stylePreset: 'industrial_pesado',
        uniformType: 'manutencao_pesada',
        uniformColor: '#ea580c',
        trousersColor: '#c2410c',
        shoeStyle: 'bota_composite',
        shoeColor: '#111827',
        helmetType: 'capacete_epi',
        helmetColor: '#f8fafc',
        hasSafetyGlasses: true,
        hasEarMuffs: true,
        accessoryType: 'cracha_escolar'
      }
    }
  ];

  const skinTones = [
    { label: 'Clara rosada', color: '#fce0c8' },
    { label: 'Clara dourada', color: '#f8d9b5' },
    { label: 'Oliva / média clara', color: '#e0ac69' },
    { label: 'Morena média', color: '#b57c48' },
    { label: 'Negra', color: '#8d5524' },
    { label: 'Negra profunda', color: '#4a2c11' }
  ];

  const headShapes: { id: AvatarCustomization['headShape']; label: string }[] = [
    { id: 'oval', label: 'Oval equilibrado' },
    { id: 'redondo', label: 'Suave / arredondado' },
    { id: 'angular', label: 'Angular / marcado' }
  ];

  const eyeStyles: { id: AvatarCustomization['eyeStyle']; label: string }[] = [
    { id: 'padrao', label: 'Clássico' },
    { id: 'amendoado', label: 'Amendoado' },
    { id: 'expressivo', label: 'Expressivo / cílios' },
    { id: 'sereno', label: 'Sereno / semi-cerrado' }
  ];

  const eyeColors = [
    { label: 'Castanho escuro', color: '#291709' },
    { label: 'Mel / âmbar', color: '#b45309' },
    { label: 'Verde esmeralda', color: '#15803d' },
    { label: 'Azul oceano', color: '#0284c7' },
    { label: 'Violeta', color: '#7e22ce' }
  ];

  const eyebrowStyles: { id: AvatarCustomization['eyebrowStyle']; label: string }[] = [
    { id: 'natural', label: 'Natural' },
    { id: 'arqueada', label: 'Arqueada' },
    { id: 'marcada', label: 'Espessa / marcada' },
    { id: 'reta', label: 'Reta moderna' }
  ];

  const hairStyles: { id: AvatarCustomization['hairStyle']; label: string }[] = [
    { id: 'curto', label: 'Curto clássico' },
    { id: 'militar', label: 'Fade / raspado' },
    { id: 'cacheado', label: 'Cacheado / black power' },
    { id: 'longo_solto', label: 'Longo solto' },
    { id: 'preso', label: 'Rabo de cavalo' },
    { id: 'coque', label: 'Coque (cabelo preso)' },
    { id: 'franja_alt', label: 'Franja assimétrica' }
  ];

  const hairColors = [
    { label: 'Preto azulado', color: '#09090b' },
    { label: 'Castanho escuro', color: '#3b1908' },
    { label: 'Ruivo acobreado', color: '#9a3412' },
    { label: 'Loiro dourado', color: '#d97706' },
    { label: 'Platinado / prata', color: '#cbd5e1' },
    { label: 'Rosa cyber', color: '#db2777' },
    { label: 'Roxo noturno', color: '#6b21a8' },
    { label: 'Azul elétrico', color: '#0284c7' }
  ];

  const makeupOptions: { id: AvatarCustomization['makeupStyle']; label: string }[] = [
    { id: 'nenhuma', label: 'Sem maquiagem' },
    { id: 'delineado_sutil', label: 'Delineado gatinho sutil' },
    { id: 'batom_suave', label: 'Batom & blush suave' },
    { id: 'gotico_marcante', label: 'Delineado duplo e batom escuro' },
    { id: 'sombra_colorida', label: 'Sombra artística e gloss' }
  ];

  const lipstickColors = [
    { label: 'Natural', color: '#9f1239' },
    { label: 'Vermelho clássico', color: '#dc2626' },
    { label: 'Rosa suave', color: '#ec4899' },
    { label: 'Vinho gótico', color: '#4c0519' },
    { label: 'Preto noturno', color: '#18181b' }
  ];

  const uniformOptions: {
    id: AvatarCustomization['uniformType'];
    label: string;
    color: string;
    trousers: string;
    desc: string;
  }[] = [
    { id: 'aluno_tecnico', label: 'Camiseta técnica + jeans', color: '#f8fafc', trousers: '#1d4ed8', desc: 'Camiseta branca escolar com gola azul e calça jeans' },
    { id: 'mecanico_geral', label: 'Macacão mecânica geral', color: '#1e3a8a', trousers: '#1e3a8a', desc: 'Azul marinho industrial para ajustadores' },
    { id: 'ajustador', label: 'Jaleco de usinagem', color: '#334155', trousers: '#0f172a', desc: 'Cinza chumbo resistente a fluido de corte' },
    { id: 'inspetor_qualidade', label: 'Camisa de laboratório', color: '#0f766e', trousers: '#1e293b', desc: 'Verde-petróleo técnico de laboratório' },
    { id: 'manutencao_pesada', label: 'Traje de alta visibilidade', color: '#ea580c', trousers: '#9a3412', desc: 'Laranja operacional com faixas refletivas' },
    { id: 'jaqueta_gotica', label: 'Jaqueta preta alternativa', color: '#18181b', trousers: '#09090b', desc: 'Jaqueta escura estruturada com detalhes prateados' },
    { id: 'moletom_casual', label: 'Moletom estudantil confortável', color: '#4f46e5', trousers: '#1e293b', desc: 'Estilo jovem casual para aulas teóricas e cantina' }
  ];

  // Renderizar o preview dinâmico do avatar em tempo real no Canvas 2D
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isSchoolShirt = custom.uniformType === 'aluno_tecnico';
    const isGothic = custom.uniformType === 'jaqueta_gotica';
    const trousersCol = custom.trousersColor || (isSchoolShirt ? '#1d4ed8' : custom.uniformColor);
    const shoeCol = custom.shoeColor || '#111827';
    const eyeCol = custom.eyeColor || '#291709';
    const lipCol = custom.lipstickColor || '#be185d';

    // Sombra no piso
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(120, 244, 68, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo longo atrás dos ombros (se selecionado)
    if (custom.hairStyle === 'longo_solto' || custom.hairStyle === 'cacheado') {
      ctx.fillStyle = custom.hairColor;
      ctx.beginPath();
      ctx.roundRect(82, 54, 76, 68, 22);
      ctx.fill();
    }

    // Coque alto ou Rabo de Cavalo
    if (custom.hairStyle === 'coque' || custom.hairStyle === 'preso') {
      ctx.fillStyle = custom.hairColor;
      ctx.beginPath();
      ctx.arc(120, 24, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pernas / Calça
    ctx.fillStyle = trousersCol;
    ctx.fillRect(95, 170, 22, 58);
    ctx.fillRect(123, 170, 22, 58);

    // Calçados (Tênis, Bota Composite ou Coturno Alternativo)
    ctx.fillStyle = shoeCol;
    const bootHeight = custom.shoeStyle === 'coturno_alt' ? 22 : 16;
    const bootY = custom.shoeStyle === 'coturno_alt' ? 219 : 225;
    ctx.fillRect(92, bootY, 26, bootHeight);
    ctx.fillRect(122, bootY, 26, bootHeight);

    // Sola / Detalhe do calçado
    ctx.fillStyle = custom.shoeStyle === 'tenis_escolar' ? '#f8fafc' : custom.shoeStyle === 'coturno_alt' ? '#94a3b8' : '#f59e0b';
    ctx.fillRect(92, 238, 26, 3);
    ctx.fillRect(122, 238, 26, 3);

    // Tronco / Camiseta ou Jaqueta ou Macacão
    ctx.fillStyle = custom.uniformColor;
    ctx.beginPath();
    ctx.roundRect(85, 95, 70, 80, [14, 14, 6, 6]);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isSchoolShirt) {
      // Gola azul técnica
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(104, 95, 32, 6);
    } else if (isGothic) {
      // Lapela prateada e zíper da jaqueta gótica
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, 96);
      ctx.lineTo(120, 174);
      ctx.stroke();
    } else if (custom.uniformType === 'manutencao_pesada' || custom.uniformType === 'mecanico_geral') {
      // Faixas refletivas
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(85, 122, 70, 5);
      ctx.fillRect(85, 146, 70, 5);
    }

    // Acessório de Pescoço / Peito (Crachá ou Colar Alternativo)
    if (custom.accessoryType === 'cracha_escolar') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(131, 114, 14, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(134, 117, 8, 6);
    } else if (custom.accessoryType === 'colar_alt') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(109, 90, 22, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(120, 96, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Braços e mangas
    ctx.fillStyle = custom.uniformColor;
    ctx.beginPath();
    ctx.roundRect(65, 100, 22, 38, 8);
    ctx.roundRect(153, 100, 22, 38, 8);
    ctx.fill();

    // Antebraços
    ctx.fillStyle = isSchoolShirt ? custom.skinTone : custom.uniformColor;
    ctx.fillRect(67, 134, 18, 30);
    ctx.fillRect(155, 134, 18, 30);

    // Relógio técnico no pulso
    if (custom.accessoryType === 'relogio_tecnico') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(66, 154, 20, 5);
    }

    // Mãos
    ctx.fillStyle = custom.skinTone;
    ctx.beginPath();
    ctx.arc(76, 168, 9.5, 0, Math.PI * 2);
    ctx.arc(164, 168, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // Pescoço
    ctx.fillStyle = custom.skinTone;
    ctx.fillRect(110, 80, 20, 16);

    // Formato do Rosto / Cabeça
    ctx.fillStyle = custom.skinTone;
    ctx.beginPath();
    if (custom.headShape === 'angular') {
      ctx.roundRect(94, 38, 52, 54, [20, 20, 14, 14]);
    } else if (custom.headShape === 'redondo') {
      ctx.arc(120, 65, 27, 0, Math.PI * 2);
    } else {
      ctx.ellipse(120, 65, 25, 27, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Maquiagem: Sombra e Blush
    if (custom.makeupStyle === 'sombra_colorida') {
      ctx.fillStyle = 'rgba(219, 39, 119, 0.38)';
      ctx.beginPath();
      ctx.ellipse(110, 61, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(130, 61, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.makeupStyle === 'gotico_marcante') {
      ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
      ctx.beginPath();
      ctx.ellipse(110, 61, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(130, 61, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (custom.makeupStyle === 'batom_suave' || custom.makeupStyle === 'sombra_colorida') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.beginPath();
      ctx.arc(103, 71, 5, 0, Math.PI * 2);
      ctx.arc(137, 71, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Olhos (Esclera + Íris colorida + Delineado)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const eyeH = custom.eyeStyle === 'sereno' ? 2.5 : 4;
    ctx.ellipse(110, 64, 5, eyeH, 0, 0, Math.PI * 2);
    ctx.ellipse(130, 64, 5, eyeH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeCol;
    ctx.beginPath();
    ctx.arc(110, 64, 2.7, 0, Math.PI * 2);
    ctx.arc(130, 64, 2.7, 0, Math.PI * 2);
    ctx.fill();

    // Delineado / Cílios
    if (custom.eyeStyle === 'expressivo' || custom.makeupStyle !== 'nenhuma') {
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = custom.makeupStyle === 'gotico_marcante' ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(103, 62);
      ctx.lineTo(115, 61);
      ctx.moveTo(125, 61);
      ctx.lineTo(137, 62);
      ctx.stroke();
    }

    // Sobrancelhas
    ctx.strokeStyle = custom.hairColor;
    ctx.lineWidth = custom.eyebrowStyle === 'marcada' ? 3 : 2;
    ctx.beginPath();
    if (custom.eyebrowStyle === 'arqueada') {
      ctx.arc(110, 59, 6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(130, 59, 6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.moveTo(104, 57);
      ctx.lineTo(115, 57);
      ctx.moveTo(125, 57);
      ctx.lineTo(136, 57);
      ctx.stroke();
    }

    // Boca / Batom
    if (custom.makeupStyle !== 'nenhuma') {
      ctx.fillStyle = custom.makeupStyle === 'gotico_marcante' ? '#4c0519' : lipCol;
      ctx.beginPath();
      ctx.ellipse(120, 76, 6.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, 74, 5.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // Cabelo Frontal / Topo
    ctx.fillStyle = custom.hairColor;
    ctx.beginPath();
    if (custom.hairStyle === 'franja_alt') {
      ctx.arc(120, 52, 27, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(102, 62);
      ctx.closePath();
      ctx.fill();
    } else if (custom.hairStyle === 'cacheado') {
      ctx.arc(120, 46, 29, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(98, 44, 12, 0, Math.PI * 2);
      ctx.arc(142, 44, 12, 0, Math.PI * 2);
      ctx.arc(120, 34, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(120, 51, 27, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
    }

    // Capacete Industrial ou Boné de Oficina (se selecionado)
    if (!custom.helmetType || custom.helmetType === 'capacete_epi') {
      ctx.fillStyle = custom.helmetColor;
      ctx.beginPath();
      ctx.arc(120, 50, 29, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(87, 48, 66, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(117, 22, 6, 30);
    } else if (custom.helmetType === 'bone_oficina') {
      ctx.fillStyle = custom.helmetColor;
      ctx.beginPath();
      ctx.arc(120, 49, 27, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(92, 47, 62, 5);
    }

    // Protetor Auricular tipo Concha (EPI)
    if (custom.hasEarMuffs) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(84, 52, 10, 22, 5);
      ctx.roundRect(146, 52, 10, 22, 5);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(120, 40, 31, Math.PI, 0);
      ctx.stroke();
    }

    // Óculos de Segurança Transparentes com Lentes de Policarbonato (EPI)
    if (custom.hasSafetyGlasses) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(101, 59, 17, 11, 4);
      ctx.roundRect(122, 59, 17, 11, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(118, 64);
      ctx.lineTo(122, 64);
      ctx.stroke();
    }

  }, [custom]);

  const handleNameBlur = () => {
    updatePlayerName(localName);
  };

  const handleConfirmAndEnter = () => {
    updatePlayerName(localName);
    navigateTo('landing');
  };

  const categories = [
    { id: 'presets', label: 'Estilos', icon: Sparkles },
    { id: 'face', label: 'Rosto', icon: Smile },
    { id: 'hair_makeup', label: 'Cabelo', icon: Palette },
    { id: 'clothing', label: 'Roupas', icon: Shirt },
    { id: 'epi', label: 'EPIs', icon: ShieldCheck }
  ] as const;

  return (
    <Page>
      <PageHeader
        title="Perfil e configurações"
        description="Personalize seu personagem e ajuste o aplicativo do seu jeito. As configurações ficam no fim da página."
        actions={
          <>
            <button onClick={randomizeCustomization} className="btn-secondary btn-sm">
              <Shuffle className="h-4 w-4 text-accent" aria-hidden /> Aleatório
            </button>
            <button onClick={resetCustomization} className="btn-secondary btn-sm">
              <RotateCcw className="h-4 w-4" aria-hidden /> Restaurar padrão
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Prévia, nome e ações */}
        <section aria-label="Prévia do personagem" className="card self-start p-5 lg:sticky lg:top-6 lg:col-span-4">
          <div className="mx-auto flex h-72 w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-lg border border-ink-800 bg-paper">
            <CharacterAvatarSvg customization={custom} mode="full" size={240} />
            <canvas ref={previewCanvasRef} width={240} height={260} className="hidden" />
          </div>

          <div className="mt-5">
            <label htmlFor="perfil-nome" className="field-label">
              Seu nome
            </label>
            <input
              id="perfil-nome"
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              className="input"
              placeholder="Digite seu nome"
              autoComplete="nickname"
            />
          </div>

          <button onClick={handleConfirmAndEnter} className="btn-primary mt-4 w-full">
            Salvar e voltar ao início <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            onClick={() => {
              updatePlayerName(localName);
              navigateTo('workshop');
            }}
            className="btn-secondary mt-2 w-full"
          >
            Visitar a Oficina 2D com meu personagem
          </button>
        </section>

        {/* Personalização por categoria */}
        <section aria-label="Personalizar personagem" className="card min-w-0 overflow-hidden lg:col-span-8">
          <div role="tablist" aria-label="Categorias" className="flex gap-1 overflow-x-auto border-b border-ink-800 px-2">
            {categories.map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`perfil-tab-${tab.id}`}
                  role="tab"
                  aria-selected={active}
                  aria-controls="perfil-painel"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    active ? 'border-accent text-ink-100' : 'border-transparent text-ink-400 hover:text-ink-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div id="perfil-painel" role="tabpanel" aria-labelledby={`perfil-tab-${activeCategory}`} className="space-y-6 p-5">
            {activeCategory === 'presets' && (
              <OptionGroup legend="Escolha um estilo pronto como ponto de partida">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {stylePresets.map((preset) => (
                    <OptionButton key={preset.id} selected={custom.stylePreset === preset.id} onClick={() => updateCustomization(preset.patch)} className="block p-3.5">
                      <span className="block font-semibold text-ink-100">{preset.label}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-400">{preset.desc}</span>
                    </OptionButton>
                  ))}
                </div>
              </OptionGroup>
            )}

            {activeCategory === 'face' && (
              <>
                <OptionGroup legend="Tom de pele">
                  <div className="flex flex-wrap gap-2">
                    {skinTones.map((st) => (
                      <OptionButton key={st.color} selected={custom.skinTone === st.color} onClick={() => updateCustomization({ skinTone: st.color })}>
                        <Swatch color={st.color} /> {st.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Formato do rosto">
                  <div className="grid grid-cols-3 gap-2">
                    {headShapes.map((hs) => (
                      <OptionButton key={hs.id} selected={custom.headShape === hs.id} onClick={() => updateCustomization({ headShape: hs.id })}>
                        {hs.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Olhos">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {eyeStyles.map((es) => (
                      <OptionButton key={es.id} selected={custom.eyeStyle === es.id} onClick={() => updateCustomization({ eyeStyle: es.id })}>
                        {es.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Sobrancelhas">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {eyebrowStyles.map((eb) => (
                      <OptionButton key={eb.id} selected={custom.eyebrowStyle === eb.id} onClick={() => updateCustomization({ eyebrowStyle: eb.id })}>
                        {eb.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Cor dos olhos">
                  <div className="flex flex-wrap gap-2">
                    {eyeColors.map((ec) => (
                      <OptionButton key={ec.color} selected={custom.eyeColor === ec.color} onClick={() => updateCustomization({ eyeColor: ec.color })}>
                        <Swatch color={ec.color} /> {ec.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
              </>
            )}

            {activeCategory === 'hair_makeup' && (
              <>
                <OptionGroup legend="Corte de cabelo">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {hairStyles.map((hs) => (
                      <OptionButton key={hs.id} selected={custom.hairStyle === hs.id} onClick={() => updateCustomization({ hairStyle: hs.id })}>
                        {hs.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Cor do cabelo">
                  <div className="flex flex-wrap gap-2">
                    {hairColors.map((hc) => (
                      <OptionButton key={hc.color} selected={custom.hairColor === hc.color} onClick={() => updateCustomization({ hairColor: hc.color })}>
                        <Swatch color={hc.color} /> {hc.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Maquiagem">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {makeupOptions.map((mk) => (
                      <OptionButton key={mk.id} selected={custom.makeupStyle === mk.id} onClick={() => updateCustomization({ makeupStyle: mk.id })}>
                        {mk.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Cor do batom">
                  <div className="flex flex-wrap gap-2">
                    {lipstickColors.map((lc) => (
                      <OptionButton
                        key={lc.color}
                        selected={custom.lipstickColor === lc.color}
                        onClick={() =>
                          updateCustomization({ lipstickColor: lc.color, makeupStyle: custom.makeupStyle === 'nenhuma' ? 'batom_suave' : custom.makeupStyle })
                        }
                      >
                        <Swatch color={lc.color} /> {lc.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
              </>
            )}

            {activeCategory === 'clothing' && (
              <>
                <OptionGroup legend="Camisetas, jaquetas e uniformes">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {uniformOptions.map((opt) => (
                      <OptionButton
                        key={opt.id}
                        selected={custom.uniformType === opt.id}
                        onClick={() => updateCustomization({ uniformType: opt.id, uniformColor: opt.color, trousersColor: opt.trousers })}
                        className="block p-3.5"
                      >
                        <span className="flex items-center gap-2 font-semibold text-ink-100">
                          <Swatch color={opt.color} /> {opt.label}
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-400">{opt.desc}</span>
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Calçados">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tenis_escolar', label: 'Tênis escolar', color: '#111827' },
                      { id: 'bota_composite', label: 'Bota de segurança', color: '#1e293b' },
                      { id: 'coturno_alt', label: 'Coturno', color: '#09090b' }
                    ].map((sh) => (
                      <OptionButton
                        key={sh.id}
                        selected={custom.shoeStyle === sh.id}
                        onClick={() => updateCustomization({ shoeStyle: sh.id as AvatarCustomization['shoeStyle'], shoeColor: sh.color })}
                      >
                        {sh.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
              </>
            )}

            {activeCategory === 'epi' && (
              <>
                <PpeContexts />
                <OptionGroup legend="Proteção da cabeça" icon={<HardHat className="h-4 w-4" aria-hidden />}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'capacete_epi', label: 'Capacete de segurança' },
                      { id: 'bone_oficina', label: 'Boné técnico' },
                      { id: 'sem_capacete', label: 'Cabelo à mostra' }
                    ].map((ht) => (
                      <OptionButton
                        key={ht.id}
                        selected={(custom.helmetType || 'capacete_epi') === ht.id}
                        onClick={() => updateCustomization({ helmetType: ht.id as AvatarCustomization['helmetType'] })}
                      >
                        {ht.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Cor do capacete ou boné">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Amarelo segurança', color: '#eab308' },
                      { label: 'Branco engenharia', color: '#f8fafc' },
                      { label: 'Azul mecânica', color: '#0284c7' },
                      { label: 'Preto alternativo', color: '#18181b' }
                    ].map((hc) => (
                      <OptionButton key={hc.color} selected={custom.helmetColor === hc.color} onClick={() => updateCustomization({ helmetColor: hc.color })}>
                        <Swatch color={hc.color} /> {hc.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
                <OptionGroup legend="Proteção dos olhos e dos ouvidos">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <OptionButton
                      selected={custom.hasSafetyGlasses}
                      onClick={() => updateCustomization({ hasSafetyGlasses: !custom.hasSafetyGlasses })}
                      className="flex gap-3 p-3.5"
                    >
                      <Glasses className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink-100">Óculos de proteção</span>
                        <span className="block text-sm text-ink-400">Policarbonato anti-impacto</span>
                      </span>
                      <span className={custom.hasSafetyGlasses ? 'badge-success' : 'badge-neutral'}>{custom.hasSafetyGlasses ? 'Usando' : 'Sem'}</span>
                    </OptionButton>
                    <OptionButton selected={custom.hasEarMuffs} onClick={() => updateCustomization({ hasEarMuffs: !custom.hasEarMuffs })} className="flex gap-3 p-3.5">
                      <Headphones className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink-100">Abafador auricular</span>
                        <span className="block text-sm text-ink-400">Atenuação de ruído (concha)</span>
                      </span>
                      <span className={custom.hasEarMuffs ? 'badge-success' : 'badge-neutral'}>{custom.hasEarMuffs ? 'Usando' : 'Sem'}</span>
                    </OptionButton>
                  </div>
                </OptionGroup>
                <OptionGroup legend="Acessórios pessoais" icon={<User className="h-4 w-4" aria-hidden />}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { id: 'cracha_escolar', label: 'Crachá escolar' },
                      { id: 'colar_alt', label: 'Colar / choker alt' },
                      { id: 'relogio_tecnico', label: 'Relógio técnico' },
                      { id: 'nenhum', label: 'Sem acessório' }
                    ].map((acc) => (
                      <OptionButton
                        key={acc.id}
                        selected={(custom.accessoryType || 'cracha_escolar') === acc.id}
                        onClick={() => updateCustomization({ accessoryType: acc.id as AvatarCustomization['accessoryType'] })}
                      >
                        {acc.label}
                      </OptionButton>
                    ))}
                  </div>
                </OptionGroup>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <SettingsPanel />
      </div>
    </Page>
  );
};

/**
 * O mesmo visual vale em todo o campus, mas cada contexto tem a sua regra:
 * convivência livre, oficina com EPI conferido na porta e EPI por tarefa nos desafios industriais.
 */
const PpeContexts: React.FC = () => {
  const { playerProfile, updateCustomization, navigateTo } = useGameState();
  const oficina = ROOMS_BY_ID.oficina;
  const missing = missingPpe(playerProfile.customization, oficina.ppe);
  return (
    <section aria-labelledby="h-ppe-ctx" className="rounded-lg border border-ink-800 bg-ink-850 p-4">
      <h3 id="h-ppe-ctx" className="text-sm font-semibold text-ink-100">
        Onde cada regra vale
      </h3>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-ink-200">Convivência, biblioteca e salas de aula</dt>
          <dd className="text-ink-400">Use o visual que quiser.</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-200">Oficina mecânica (Oficina 2D)</dt>
          <dd className="text-ink-400">
            A porta só abre com:
            <ul className="mt-1 space-y-0.5">
              {(oficina.ppe ?? []).map((item) => {
                const ok = !missing.includes(item);
                return (
                  <li key={item} className="flex gap-2">
                    <span className={`w-11 shrink-0 text-xs font-semibold ${ok ? 'text-emerald-400' : 'text-amber-300'}`}>{ok ? 'OK' : 'FALTA'}</span>
                    <span className="text-ink-300">{PPE_LABEL[item]}</span>
                  </li>
                );
              })}
            </ul>
            {missing.length > 0 && (
              <button type="button" className="btn-secondary btn-sm mt-2" onClick={() => updateCustomization(ppeFix(missing))}>
                Vestir o que falta
              </button>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink-200">Tarefas industriais (Desafios)</dt>
          <dd className="text-ink-400">
            Cada tarefa tem os próprios riscos; nem toda tarefa pede todos os EPIs.{' '}
            <button type="button" className="link" onClick={() => navigateTo('games', 'epi-tarefa')}>
              Treinar no desafio “EPI certo para a tarefa”
            </button>
          </dd>
        </div>
      </dl>
    </section>
  );
};

/** Grupo de opções com título (fieldset/legend). */
const OptionGroup: React.FC<{ legend: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ legend, icon, children }) => (
  <fieldset>
    <legend className="field-label flex items-center gap-1.5">
      {icon}
      {legend}
    </legend>
    {children}
  </fieldset>
);

/** Opção selecionável do personagem: mesma aparência em todas as categorias. */
const OptionButton: React.FC<{ selected: boolean; onClick: () => void; className?: string; children: React.ReactNode }> = ({
  selected,
  onClick,
  className = 'inline-flex items-center gap-2',
  children
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`min-h-[40px] rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
      selected ? 'border-accent bg-accent-soft font-medium text-ink-100' : 'border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600 hover:text-ink-100'
    } ${className}`}
  >
    {children}
  </button>
);

const Swatch: React.FC<{ color: string }> = ({ color }) => (
  <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-ink-600" style={{ backgroundColor: color }} aria-hidden />
);
