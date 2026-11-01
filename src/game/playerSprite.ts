import Phaser from 'phaser';
import { AvatarCustomization } from '../types/game';

/**
 * Sprites do personagem na Oficina 2D, desenhados num canvas a partir do visual escolhido no Perfil
 * (uma textura por direção: player-down, player-up, player-left, player-right).
 */
export const PlayerSprite = {
  create(scene: Phaser.Scene, custom?: AvatarCustomization): void {
    const directions = ['down', 'up', 'left', 'right'] as const;
    const isTechStudent = !custom || custom.uniformType === 'aluno_tecnico';
    const isHiVis = custom?.uniformType === 'manutencao_pesada';
    const shirtColor = isTechStudent ? '#f8fafc' : (custom?.uniformColor || '#1e3a8a');
    const trousersColor = custom?.trousersColor || (isTechStudent ? '#1d4ed8' : (custom?.uniformColor || '#1e3a8a'));
    const shoeColor = custom?.shoeColor || '#111827';
    const hasHelmet = custom?.helmetType !== 'sem_capacete';
    const headCoverColor = !hasHelmet
      ? (custom?.hairColor || '#1f2937')
      : (custom?.helmetColor || '#eab308');
    const skinColor = custom?.skinTone || '#e0ac69';
    const eyeColor = custom?.eyeColor || '#1e293b';
    const hasGlasses = custom?.hasSafetyGlasses ?? true;
    const hasEars = custom?.hasEarMuffs ?? true;

    directions.forEach((dir) => {
      const texKey = `player-${dir}`;
      if (scene.textures.exists(texKey)) {
        scene.textures.remove(texKey);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 56;
      const ctx = canvas.getContext('2d')!;

      // Sombra projetada no piso
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(24, 50, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pernas e Botas articuladas
      ctx.fillStyle = trousersColor;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      if (dir === 'left' || dir === 'right') {
        ctx.fillRect(20, 34, 8, 12);
        ctx.strokeRect(20, 34, 8, 12);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(dir === 'left' ? 17 : 20, 45, 10, 5);
      } else {
        ctx.fillRect(16, 34, 7, 12);
        ctx.strokeRect(16, 34, 7, 12);
        ctx.fillRect(25, 34, 7, 12);
        ctx.strokeRect(25, 34, 7, 12);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(15, 45, 8, 5);
        ctx.fillRect(25, 45, 8, 5);
      }

      // Tronco estruturado (camiseta, jaqueta ou macacão)
      ctx.fillStyle = shirtColor;
      ctx.beginPath();
      ctx.roundRect(14, 21, 20, 15, 4);
      ctx.fill();
      ctx.stroke();

      // Faixas refletivas ou gola técnica
      if (isHiVis) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(15, 29, 18, 2.5);
      } else if (isTechStudent) {
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(18, 21, 12, 2.5);
      }

      // Crachá técnico no peito
      if ((isTechStudent || custom?.accessoryType === 'cracha_escolar') && dir === 'down') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(26, 26, 5, 6);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(27, 28, 3, 2);
      }

      // Braços e Mãos
      ctx.fillStyle = shirtColor;
      if (dir !== 'left') {
        ctx.fillRect(10, 22, 4, 10);
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(12, 33, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (dir !== 'right') {
        ctx.fillStyle = shirtColor;
        ctx.fillRect(34, 22, 4, 10);
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(36, 33, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cabeça e Rosto Expressivo
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(24, 14, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Olhos e expressão facial quando visíveis
      if (dir === 'down') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(19.5, 13, 3.2, 2.5);
        ctx.fillRect(25.3, 13, 3.2, 2.5);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(20.5, 13.5, 1.8, 2);
        ctx.fillRect(26.3, 13.5, 1.8, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = eyeColor;
        ctx.fillRect(17.5, 13.5, 2, 2);
      } else if (dir === 'right') {
        ctx.fillStyle = eyeColor;
        ctx.fillRect(28.5, 13.5, 2, 2);
      }

      // Capacete EPI com nervura ou Cabelo estilizado
      ctx.fillStyle = headCoverColor;
      ctx.beginPath();
      ctx.arc(24, 11, 9.2, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();
      if (hasHelmet) {
        ctx.fillRect(14, 10, 20, 2.5);
      }

      // Abafadores auriculares (EPI)
      if (hasEars && dir !== 'left' && dir !== 'right') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(13, 12, 2.8, 5);
        ctx.fillRect(32.2, 12, 2.8, 5);
      }

      // Óculos de segurança policarbonato
      if (hasGlasses && dir === 'down') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(18.5, 12.2, 11, 4);
      }

      scene.textures.addCanvas(texKey, canvas);
    });
  }
};
