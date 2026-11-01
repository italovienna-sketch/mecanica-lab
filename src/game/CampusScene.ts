import Phaser from 'phaser';
import { PlayerSprite } from './playerSprite';
import {
  CampusStation,
  CORRIDOR_AREA,
  PLAYER_BODY,
  PROPS,
  Prop,
  ROOMS,
  Rect,
  Room,
  SOLID_WALLS,
  STATIONS,
  WORLD,
  areaAt,
  doorGate,
  nearestStation
} from './campusLayout';
import { AvatarCustomization, PlayerPosition } from '../types/game';

export interface CampusCallbacks {
  onStationChange: (station: CampusStation | null) => void;
  onInteract: (station: CampusStation) => void;
  onAreaChange: (area: { id: string; name: string } | null) => void;
  /** Personagem encostou na porta fechada de uma sala que exige EPI. */
  onGateBlocked: (room: Room) => void;
  /** Posição para o minimapa (chamado no máximo a cada ~120 ms enquanto anda). */
  onMove: (pos: PlayerPosition) => void;
}

export interface CampusOptions {
  start: PlayerPosition;
  customization?: AvatarCustomization;
  reducedMotion: boolean;
  /** Salas cuja porta está liberada (EPI conferido). */
  openRooms: string[];
}

/** Cores da planta (tons do tema escuro do sistema visual; um acento laranja só para o que é interativo). */
const C = {
  void: 0x0f100e,
  floor: { concrete: 0x22241f, lab: 0x1f2524, wood: 0x29251f, tile: 0x1d1f1b } as Record<Room['floor'], number>,
  corridor: 0x1a1b18,
  grid: 0x30322c,
  wall: 0xc6c4ba,
  propFill: 0x30322c,
  propEdge: 0x858780,
  safety: 0xd4a017,
  accent: 0xe8590c,
  text: '#c6c4ba',
  textDim: '#9b9a91',
  textAccent: '#ff8a4c'
};

const FONT = '"IBM Plex Sans", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SPEED = 210; // px/s, independente da taxa de quadros (física arcade usa o delta)
/** O sprite tem 48×56; o corpo de colisão fica nos pés. Posição lógica do personagem = centro do corpo = sprite.y + FOOT. */
const FOOT = 56 / 2 - 4 - PLAYER_BODY / 2;

/** Campos de formulário recebem as teclas normalmente: o personagem não anda enquanto o aluno digita. */
function typingInForm(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export class CampusScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;
  private gates = new Map<string, { body: Phaser.GameObjects.Rectangle; art: Phaser.GameObjects.Graphics }>();
  private markers = new Map<string, Phaser.GameObjects.Graphics>();
  private virtualDir: { x: number; y: number } | null = null;
  private activeStation: CampusStation | null = null;
  private areaId: string | null = null;
  private lastMoveEmit = 0;
  private gateCooldownUntil = 0;
  private facing: PlayerPosition['direction'];

  constructor(
    private callbacks: CampusCallbacks,
    private options: CampusOptions
  ) {
    super({ key: 'CampusScene' });
    this.facing = options.start.direction;
  }

  preload(): void {
    PlayerSprite.create(this, this.options.customization);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(C.void);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.drawFloors();
    this.drawProps();
    const solids = this.physics.add.staticGroup();
    for (const w of SOLID_WALLS) solids.add(this.solidRect(w));
    for (const p of PROPS) solids.add(this.solidRect(p.rect));
    this.drawWalls();
    this.drawStations();
    this.drawRoomStamps();
    this.bakeStaticLayers();
    this.createGates();

    this.player = this.physics.add.sprite(this.options.start.x, this.options.start.y - FOOT, `player-${this.facing}`);
    this.player.setDepth(20);
    this.player.setCollideWorldBounds(true);
    // Corpo de colisão nos pés (parte de baixo do sprite 48×56), igual ao PLAYER_BODY usado nos testes de geometria.
    this.player.body!.setSize(PLAYER_BODY, PLAYER_BODY);
    this.player.body!.setOffset((48 - PLAYER_BODY) / 2, 56 - PLAYER_BODY - 4);
    this.physics.add.collider(this.player, solids);
    for (const [roomId, gate] of this.gates) {
      this.physics.add.collider(this.player, gate.body, () => this.handleGateHit(roomId));
    }

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD.width, WORLD.height);
    cam.startFollow(this.player, true, this.options.reducedMotion ? 1 : 0.12, this.options.reducedMotion ? 1 : 0.12);
    this.fitZoom();
    this.scale.on('resize', this.fitZoom, this);

    const kb = this.input.keyboard!;
    // Sem captura global: setas e WASD continuam funcionando em campos de texto e botões fora do mapa.
    const k = (code: number) => kb.addKey(code, false);
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = { up: k(K.UP), down: k(K.DOWN), left: k(K.LEFT), right: k(K.RIGHT), w: k(K.W), a: k(K.A), s: k(K.S), d: k(K.D) };
    const interact = (ev: KeyboardEvent) => {
      if (typingInForm() || ev.repeat) return;
      // Enter/Espaço num botão da interface já acionam o botão; aqui só valem com o foco no mapa.
      const onUi = (document.activeElement as HTMLElement | null)?.closest('button, a, [role="dialog"]');
      if (ev.key !== 'e' && ev.key !== 'E' && onUi) return;
      this.interact();
    };
    kb.on('keydown-E', interact);
    kb.on('keydown-ENTER', interact);
    kb.on('keydown-SPACE', interact);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb.off('keydown-E', interact);
      kb.off('keydown-ENTER', interact);
      kb.off('keydown-SPACE', interact);
      this.scale.off('resize', this.fitZoom, this);
    });

    this.refreshArea(true);
  }

  /* ───────────── API para a interface React ───────────── */

  setVirtualDirection(dir: { x: number; y: number } | null): void {
    this.virtualDir = dir;
  }

  interact(): void {
    if (this.activeStation) this.callbacks.onInteract(this.activeStation);
  }

  teleport(x: number, y: number): void {
    if (!this.player) return;
    this.player.setPosition(x, y - FOOT);
    this.player.setVelocity(0, 0);
    this.cameras.main.centerOn(x, y);
    this.refreshArea(true);
    this.emitMove(true);
  }

  getPosition(): PlayerPosition {
    if (!this.player) return { ...this.options.start };
    return { x: Math.round(this.player.x), y: Math.round(this.player.y + FOOT), direction: this.facing };
  }

  setRoomOpen(roomId: string, open: boolean): void {
    const gate = this.gates.get(roomId);
    if (!gate) return;
    (gate.body.body as Phaser.Physics.Arcade.StaticBody).enable = !open;
    gate.art.setVisible(!open);
  }

  updateAvatar(custom: AvatarCustomization): void {
    PlayerSprite.create(this, custom);
    this.player?.setTexture(`player-${this.facing}`);
  }

  /* ───────────── Laço ───────────── */

  update(time: number): void {
    if (!this.player?.body) return;
    let dx = 0;
    let dy = 0;
    if (!typingInForm()) {
      const k = this.keys;
      if (k.left.isDown || k.a.isDown) dx -= 1;
      if (k.right.isDown || k.d.isDown) dx += 1;
      if (k.up.isDown || k.w.isDown) dy -= 1;
      if (k.down.isDown || k.s.isDown) dy += 1;
    }
    if (this.virtualDir) {
      dx = dx || this.virtualDir.x;
      dy = dy || this.virtualDir.y;
    }
    const len = Math.hypot(dx, dy) || 1;
    this.player.setVelocity((dx / len) * SPEED, (dy / len) * SPEED);

    if (dx || dy) {
      const dir: PlayerPosition['direction'] = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      if (dir !== this.facing) {
        this.facing = dir;
        this.player.setTexture(`player-${dir}`);
      }
      if (time - this.lastMoveEmit > 120) {
        this.lastMoveEmit = time;
        this.emitMove();
        this.refreshArea();
      }
    }

    const near = nearestStation(this.player.x, this.player.y + FOOT);
    if (near?.id !== this.activeStation?.id) {
      if (this.activeStation) this.paintMarker(this.activeStation, false);
      if (near) this.paintMarker(near, true);
      this.activeStation = near;
      this.callbacks.onStationChange(near);
    }
  }

  /* ───────────── Internos ───────────── */

  private fitZoom(): void {
    const { width, height } = this.scale.gameSize;
    // Cerca de 1100 px do mundo na largura em telas grandes; no celular a escala mínima mantém os rótulos legíveis.
    const zoom = Phaser.Math.Clamp(Math.min(width / 1100, height / 700), 0.75, 1.2);
    this.cameras.main.setZoom(zoom);
  }

  private emitMove(force = false): void {
    if (!this.player) return;
    if (force) this.lastMoveEmit = this.time.now;
    this.callbacks.onMove(this.getPosition());
  }

  private refreshArea(force = false): void {
    const area = areaAt(this.player.x, this.player.y + FOOT);
    if (force || (area?.id ?? null) !== this.areaId) {
      this.areaId = area?.id ?? null;
      this.callbacks.onAreaChange(area);
    }
  }

  /**
   * Planta, móveis, paredes e rótulos não mudam: desenha tudo uma vez numa textura e descarta os objetos.
   * No renderizador Canvas cada linha da malha seria redesenhada a cada quadro (dezenas de milhares de
   * operações), o que derrubava a taxa de quadros em máquinas fracas.
   */
  private bakeStaticLayers(): void {
    const markers = new Set<Phaser.GameObjects.GameObject>(this.markers.values());
    const statics = this.children.list
      .filter((o) => (o instanceof Phaser.GameObjects.Graphics || o instanceof Phaser.GameObjects.Text) && !markers.has(o))
      .map((o, i) => ({ o: o as Phaser.GameObjects.Graphics | Phaser.GameObjects.Text, i }))
      .sort((a, b) => a.o.depth - b.o.depth || a.i - b.i)
      .map(({ o }) => o);
    const rt = this.add.renderTexture(0, 0, WORLD.width, WORLD.height).setOrigin(0, 0).setDepth(0);
    rt.draw(statics);
    statics.forEach((o) => o.destroy());
    for (const m of markers) (m as Phaser.GameObjects.Graphics).setDepth(6);
  }

  private handleGateHit(roomId: string): void {
    const now = this.time.now;
    if (now < this.gateCooldownUntil) return;
    this.gateCooldownUntil = now + 1500;
    const room = ROOMS.find((r) => r.id === roomId);
    if (room) this.callbacks.onGateBlocked(room);
  }

  private solidRect(r: Rect): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
    rect.setVisible(false);
    return rect;
  }

  private drawFloors(): void {
    const g = this.add.graphics();
    const c = CORRIDOR_AREA.rect;
    g.fillStyle(C.corridor).fillRect(c.x, c.y, c.w, c.h);
    for (const room of ROOMS) {
      const { x, y, w, h } = room.rect;
      g.fillStyle(C.floor[room.floor]).fillRect(x, y, w, h);
    }
    // Malha de 40 px como numa folha quadriculada: dá noção de escala e de movimento.
    g.lineStyle(1, C.grid, 0.55);
    for (const area of [...ROOMS.map((r) => r.rect), c]) {
      for (let gx = area.x + 40; gx < area.x + area.w; gx += 40) g.lineBetween(gx, area.y, gx, area.y + area.h);
      for (let gy = area.y + 40; gy < area.y + area.h; gy += 40) g.lineBetween(area.x, gy, area.x + area.w, gy);
    }
    // Faixas amarelas de circulação no corredor (demarcação de piso da oficina).
    g.lineStyle(3, C.safety, 0.7);
    g.lineBetween(c.x + 20, c.y + 22, c.x + c.w - 20, c.y + 22);
    g.lineBetween(c.x + 20, c.y + c.h - 22, c.x + c.w - 20, c.y + c.h - 22);
    // Faixa de segurança em volta das máquinas da oficina.
    g.lineStyle(2, C.safety, 0.55);
    for (const p of PROPS.filter((p) => p.kind === 'machine' || p.kind === 'lathe')) {
      g.strokeRect(p.rect.x - 10, p.rect.y - 4, p.rect.w + 20, p.rect.h + 14);
    }
  }

  private drawWalls(): void {
    const g = this.add.graphics();
    g.fillStyle(C.wall);
    for (const w of SOLID_WALLS) g.fillRect(w.x, w.y, w.w, w.h);
    g.setDepth(5);
    // Arco de abertura das portas, como na representação de planta baixa.
    const arcs = this.add.graphics().setDepth(4);
    arcs.lineStyle(1, C.wall, 0.35);
    for (const room of ROOMS) {
      for (const d of room.doors) {
        const span = d.to - d.from;
        if (span > 120) continue; // vão livre (sem porta)
        if (d.side === 'bottom') {
          const y = room.rect.y + room.rect.h;
          arcs.beginPath();
          arcs.arc(d.from, y, span, Phaser.Math.DegToRad(-90), 0);
          arcs.strokePath();
          arcs.lineBetween(d.from, y, d.from, y - span);
        } else if (d.side === 'top') {
          const y = room.rect.y;
          arcs.beginPath();
          arcs.arc(d.from, y, span, 0, Phaser.Math.DegToRad(90));
          arcs.strokePath();
          arcs.lineBetween(d.from, y, d.from, y + span);
        }
      }
    }
  }

  private drawProps(): void {
    const g = this.add.graphics().setDepth(3);
    for (const p of PROPS) this.drawProp(g, p);
  }

  private drawProp(g: Phaser.GameObjects.Graphics, p: Prop): void {
    const { x, y, w, h } = p.rect;
    g.fillStyle(C.propFill).fillRect(x, y, w, h);
    g.lineStyle(1.5, C.propEdge).strokeRect(x, y, w, h);
    g.lineStyle(1, C.propEdge, 0.6);
    switch (p.kind) {
      case 'machine':
        // carcaça + eixo: dois blocos ligados por uma linha de centro
        g.strokeRect(x + 10, y + 12, w * 0.4, h - 24);
        g.strokeCircle(x + w * 0.72, y + h / 2, Math.min(w, h) * 0.26);
        g.lineBetween(x + 10 + w * 0.4, y + h / 2, x + w * 0.72 - Math.min(w, h) * 0.26, y + h / 2);
        break;
      case 'lathe':
        g.strokeRect(x + 6, y + 10, 40, h - 20); // cabeçote fixo
        g.strokeRect(x + w - 40, y + 16, 32, h - 32); // cabeçote móvel
        g.lineBetween(x + 46, y + h / 2, x + w - 40, y + h / 2); // linha de centro
        g.strokeRect(x + w * 0.45, y + 8, 30, h - 16); // carro
        break;
      case 'bench':
      case 'table':
      case 'desk':
        g.strokeRect(x + 4, y + 4, w - 8, h - 8);
        break;
      case 'shelf':
        for (let i = 1; i < 6; i++) {
          if (w > h) g.lineBetween(x + (w * i) / 6, y, x + (w * i) / 6, y + h);
          else g.lineBetween(x, y + (h * i) / 6, x + w, y + (h * i) / 6);
        }
        break;
      case 'locker':
      case 'cabinet':
        for (let i = 1; i < 4; i++) {
          if (h > w) g.lineBetween(x, y + (h * i) / 4, x + w, y + (h * i) / 4);
          else g.lineBetween(x + (w * i) / 4, y, x + (w * i) / 4, y + h);
        }
        break;
      case 'sofa':
        g.strokeRect(x + 6, y + 6, w - 12, h - 18);
        break;
      case 'plant':
        g.strokeCircle(x + w / 2, y + h / 2, w / 2 - 4);
        g.strokeCircle(x + w / 2, y + h / 2, w / 4);
        break;
      case 'board':
        break;
    }
    if (p.label && p.kind !== 'board') {
      const vertical = h > w * 1.5;
      this.add
        .text(x + w / 2, y + h / 2, p.label.toUpperCase(), { fontFamily: MONO, fontSize: '9px', color: C.textDim })
        .setOrigin(0.5)
        .setAngle(vertical ? -90 : 0)
        .setDepth(3);
    }
  }

  private drawStations(): void {
    for (const st of STATIONS) {
      const g = this.add.graphics().setDepth(6);
      this.markers.set(st.id, g);
      this.paintMarker(st, false);
      this.add
        .text(st.x, st.y + 20, st.name, { fontFamily: FONT, fontSize: '12px', color: C.text, fontStyle: '500' })
        .setOrigin(0.5, 0)
        .setDepth(6);
    }
  }

  /** Marca no piso: losango vazado; quando o personagem está perto, preenchido no acento. */
  private paintMarker(st: CampusStation, active: boolean): void {
    const g = this.markers.get(st.id);
    if (!g) return;
    g.clear();
    const r = active ? 15 : 12;
    const pts = [new Phaser.Math.Vector2(st.x, st.y - r), new Phaser.Math.Vector2(st.x + r, st.y), new Phaser.Math.Vector2(st.x, st.y + r), new Phaser.Math.Vector2(st.x - r, st.y)];
    if (active) g.fillStyle(C.accent, 0.9).fillPoints(pts, true);
    g.lineStyle(2, C.accent, active ? 1 : 0.8).strokePoints(pts, true);
  }

  /**
   * Placa de cada sala no corredor, ao lado da porta, no formato do carimbo de uma prancha:
   * código à esquerda, nome e regra de entrada à direita.
   */
  private drawRoomStamps(): void {
    const c = CORRIDOR_AREA.rect;
    for (const room of ROOMS) {
      const door = room.doors[0];
      const above = room.rect.y < c.y; // sala de cima: placa logo abaixo da parede
      const name = this.add.text(0, 0, room.name, { fontFamily: FONT, fontSize: '13px', color: C.text, fontStyle: '600' }).setDepth(7);
      const rule = this.add
        .text(0, 0, room.ppe ? 'Entrada com EPI' : 'Entrada livre', { fontFamily: MONO, fontSize: '10px', color: room.ppe ? '#e5b84a' : C.textDim })
        .setDepth(7);
      const w = 54 + Math.max(name.width, rule.width) + 12;
      const h = 44;
      const x = door.to + 12;
      const y = above ? c.y + 10 : c.y + c.h - h - 10;
      const g = this.add.graphics().setDepth(6);
      g.fillStyle(C.void).fillRect(x, y, w, h);
      g.lineStyle(1, C.wall, 0.7).strokeRect(x, y, w, h);
      g.lineBetween(x + 44, y, x + 44, y + h);
      this.add.text(x + 22, y + h / 2, room.code, { fontFamily: MONO, fontSize: '17px', color: C.textAccent, fontStyle: '600' }).setOrigin(0.5).setDepth(7);
      name.setPosition(x + 54, y + 6);
      rule.setPosition(x + 54, y + 25);
    }
  }

  private createGates(): void {
    for (const room of ROOMS.filter((r) => r.ppe?.length)) {
      const rect = doorGate(room);
      if (!rect) continue;
      const body = this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h).setVisible(false);
      this.physics.add.existing(body, true);
      // Faixa zebrada amarela e preta na porta (sinal de acesso controlado).
      const art = this.add.graphics().setDepth(5);
      art.fillStyle(0x111111).fillRect(rect.x, rect.y, rect.w, rect.h);
      art.fillStyle(C.safety);
      for (let sx = rect.x; sx < rect.x + rect.w; sx += 12) art.fillRect(sx, rect.y, 6, rect.h);
      this.gates.set(room.id, { body, art });
      this.setRoomOpen(room.id, this.options.openRooms.includes(room.id));
    }
  }
}
