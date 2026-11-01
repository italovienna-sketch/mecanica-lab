import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MachineData } from '../../data/mechanicalMachines';
import { MachineLabConfig, ProcedureStep, Vec3, buildPoses } from '../../data/labMission';
import { GraphicsQuality } from '../../types/game';
import { buildCentrifugalPump } from './models/pumpModel';
import { buildGearPump } from './models/gearPumpModel';
import { buildConventionalLathe } from './models/latheModel';
import { buildBearingAssembly } from './models/bearingAssemblyModel';
import { buildBeltConveyor } from './models/beltConveyorModel';
import { buildDiaphragmPump } from './models/diaphragmPumpModel';
import { buildMotorGearbox } from './models/motorGearboxModel';

type ProceduralBuilder = (quality: 'high' | 'low') => { root: THREE.Group; parts: Map<string, THREE.Group>; environment: THREE.Group; animate?: (dt: number) => void };

const PROCEDURAL_BUILDERS: Record<Exclude<MachineLabConfig['source'], 'glb'>, ProceduralBuilder> = {
  'procedural-pump': buildCentrifugalPump,
  'procedural-gear-pump': buildGearPump,
  'procedural-lathe': buildConventionalLathe,
  'procedural-bearing-assembly': buildBearingAssembly,
  'procedural-conveyor': buildBeltConveyor,
  'procedural-diaphragm-pump': buildDiaphragmPump,
  'procedural-motor-gearbox': buildMotorGearbox
};

export type CameraView = 'iso' | 'front' | 'side' | 'top';

/** Direção da câmera (a partir do alvo) em cada vista pronta. */
export const CAMERA_DIRS: Record<CameraView, Vec3> = {
  iso: [0.62, 0.42, 0.82],
  front: [0.02, 0.12, 1],
  side: [1, 0.12, 0.02],
  top: [0.02, 1, 0.08]
};

export interface EngineCallbacks {
  onHover?: (partId: string | null) => void;
  onSelect?: (partId: string) => void;
  onLoadState?: (state: 'loading' | 'loaded' | 'error', message?: string) => void;
  onAnimationDone?: () => void;
  onWebGLError?: (message: string) => void;
  /** Chamado uma vez se a média de tempo por quadro indicar um computador lento para o 3D. */
  onSlowDevice?: (avgFrameMs: number) => void;
}

interface Anim {
  partId: string;
  path: THREE.Vector3[];
  /** 0..1 */
  t: number;
  duration: number;
}

const HIGHLIGHT = new THREE.Color(0xff7a2f);
const TARGET = new THREE.Color(0xf2b233);

/**
 * Motor 3D do laboratório. Princípios (skill threejs-3d-lab):
 * - renderiza apenas quando algo muda (câmera, animação, destaque), não 60 vezes por segundo à toa;
 * - descarta geometrias, materiais, texturas, listeners e o contexto WebGL ao sair;
 * - qualidade "low" desliga sombras, ambiente PBR e suavização para computadores mais simples.
 */
export class ThreeSceneEngine {
  private container: HTMLElement;
  private labelLayer: HTMLElement | null;
  private callbacks: EngineCallbacks;
  private quality: GraphicsQuality;
  private reducedMotion: boolean;
  private machine: MachineData;
  private config: MachineLabConfig;

  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private perspCamera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  /** Projeção ortográfica ("vista técnica"): sem perspectiva, como num desenho. */
  private orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 200);
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = this.perspCamera;
  /** Meia altura do enquadramento ortográfico com zoom 1 (equivale à distância inicial da câmera). */
  private orthoHalfH = 4;
  /** Distância da câmera ao alvo na vista inicial. */
  private homeDistance = 10;
  private flight: number | null = null;
  private flightToken = 0;
  private controls: OrbitControls | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private pmrem: THREE.PMREMGenerator | null = null;
  private envTexture: THREE.Texture | null = null;
  private disposed = false;
  private frame: number | null = null;
  private lastTime = 0;
  private needsRender = true;

  private modelRoot = new THREE.Group();
  private environment = new THREE.Group();
  private parts = new Map<string, THREE.Group>();
  /** Deslocamentos extras por peça: montam um conjunto com erro para a conferência de montagem. */
  private nudges = new Map<string, Vec3>();
  /** Posição montada de cada peça (no espaço do modelo). */
  private basePos = new Map<string, THREE.Vector3>();
  /** Deslocamento atual da pose (sequência de montagem/desmontagem). */
  private poseOffset = new Map<string, THREE.Vector3>();
  private explodeT = 0;
  private explodeTarget = 0;
  private anims: Anim[] = [];
  private poses: Record<string, Vec3>[] = [];
  private poseIndex = 0;

  private materialsByPart = new Map<string, THREE.MeshStandardMaterial[]>();
  private originalEmissive = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; intensity: number; opacity: number; transparent: boolean; depthWrite: boolean }>();

  private selectedId: string | null = null;
  private hoveredId: string | null = null;
  private targetId: string | null = null;
  private hidden = new Set<string>();
  private isolatedId: string | null = null;
  private xray = false;
  private cutaway = false;
  /** Plano de corte da vista em corte: esconde a metade da frente (z > 0) das peças de carcaça. */
  private clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  private xrayParts = new Set<string>();
  private labelsVisible = false;
  private labelAnchors = new Map<string, THREE.Vector3>();

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private downPos: { x: number; y: number } | null = null;
  private hoverQueued = false;
  private lastPointerEvent: PointerEvent | null = null;
  private homeCamera = { position: new THREE.Vector3(), target: new THREE.Vector3() };
  private modelRadius = 4;
  private loadedFromGlb = false;
  /** O .glb do pipeline falhou nesta sessão: não tenta de novo a cada recarga do modelo. */
  private partsGlbFailed = false;
  private renderTimes: number[] = [];
  private frameIntervals: number[] = [];
  private lastActiveTick = 0;
  private activeTicksSinceLoad = 0;
  private slowReported = false;
  private shadowDirty = true;
  /** Animação de operação do modelo (peças girando), quando o modelo tem uma. */
  private animator: ((dt: number) => void) | null = null;
  private running = false;

  constructor(options: {
    container: HTMLElement;
    labelLayer?: HTMLElement | null;
    machine: MachineData;
    config: MachineLabConfig;
    quality: GraphicsQuality;
    reducedMotion: boolean;
    callbacks: EngineCallbacks;
    forceLoadError?: boolean;
  }) {
    this.container = options.container;
    this.labelLayer = options.labelLayer ?? null;
    this.machine = options.machine;
    this.config = options.config;
    this.quality = options.quality;
    this.reducedMotion = options.reducedMotion;
    this.callbacks = options.callbacks;

    if (!this.initRenderer()) return;
    this.initScene();
    this.initControls();
    this.attachEvents();
    this.loadModel(options.forceLoadError);
  }

  /* ───────────────────────── Inicialização ───────────────────────── */

  private initRenderer(): boolean {
    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: this.quality === 'high',
        powerPreference: this.quality === 'high' ? 'high-performance' : 'low-power',
        alpha: false
      });
      renderer.setPixelRatio(this.quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = this.quality === 'high';
      renderer.shadowMap.type = THREE.PCFShadowMap;
      // Sombras só são recalculadas quando peças se movem (girar a câmera não exige novo mapa).
      renderer.shadowMap.autoUpdate = false;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      this.container.appendChild(renderer.domElement);
      this.renderer = renderer;
      this.resize();
      return true;
    } catch {
      this.callbacks.onWebGLError?.(
        'Este navegador ou computador não conseguiu iniciar o 3D (WebGL). Use a “Ilustração 2D”, que mostra as mesmas peças e etapas.'
      );
      return false;
    }
  }

  private initScene() {
    const bg = new THREE.Color(0x1a1b19);
    this.scene.background = bg;

    if (this.quality === 'high' && this.renderer) {
      this.pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.envTexture = this.pmrem.fromScene(room, 0.04).texture;
      this.scene.environment = this.envTexture;
      this.scene.environmentIntensity = 0.55;
      room.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    }

    const hemi = new THREE.HemisphereLight(0xf4f1ea, 0x2a2b28, this.quality === 'high' ? 0.7 : 1.4);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, this.quality === 'high' ? 2.2 : 2.0);
    key.position.set(4, 9, 7);
    if (this.quality === 'high') {
      key.castShadow = true;
      key.shadow.mapSize.set(1536, 1536);
      key.shadow.camera.left = -9;
      key.shadow.camera.right = 9;
      key.shadow.camera.top = 9;
      key.shadow.camera.bottom = -9;
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 30;
      key.shadow.bias = -0.0004;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 4;
    }
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8f2, 0.6);
    fill.position.set(-6, 4, -5);
    this.scene.add(fill);

    // Piso da bancada com grade discreta (referência espacial)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x232421, roughness: 0.95, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    const floorY = this.config.floorY ?? -2.2;
    floor.position.y = floorY;
    floor.receiveShadow = true;
    this.environment.add(floor);
    const grid = new THREE.GridHelper(40, 40, 0x3a3c37, 0x2c2e2a);
    grid.position.y = floorY + 0.005;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    this.environment.add(grid);

    this.scene.add(this.environment);
    this.scene.add(this.modelRoot);
  }

  private initControls() {
    if (!this.renderer) return;
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = !this.reducedMotion;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.53;
    controls.minZoom = 0.35;
    controls.maxZoom = 8;
    controls.addEventListener('change', this.requestRender);
    // Arrastar a câmera interrompe uma transição em andamento (a pessoa manda).
    controls.addEventListener('start', this.cancelFlight);
    this.controls = controls;
  }

  private attachEvents() {
    if (!this.renderer) return;
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerleave', this.onPointerLeave);
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.requestRender();
    });
    this.resizeObserver.observe(this.container);
  }

  /* ───────────────────────── Carregamento do modelo ───────────────────────── */

  public loadModel(forceError = false) {
    this.clearModel();
    this.callbacks.onLoadState?.('loading');

    // Modelo do pipeline Blender (mais detalhado) na qualidade alta; o procedural fica de reserva.
    if (this.config.modelUrl && this.config.source !== 'glb' && this.quality === 'high' && !forceError && !this.partsGlbFailed) {
      this.loadPartsGlb(this.config.modelUrl);
      return;
    }

    if (this.config.source !== 'glb' && !forceError) {
      this.loadProcedural();
      return;
    }

    const url = forceError ? '/assets/models/nao-existe.glb' : this.machine.glbUrl;
    if (!url) {
      this.callbacks.onLoadState?.('error', 'Este equipamento ainda não tem modelo 3D.');
      return;
    }
    new GLTFLoader().load(
      url,
      (gltf) => {
        if (this.disposed) {
          disposeObject(gltf.scene);
          return;
        }
        this.loadedFromGlb = true;
        this.machine.parts.forEach((p) => {
          const node = gltf.scene.getObjectByName(p.id);
          if (!node) return;
          const wrapper = new THREE.Group();
          wrapper.name = p.id;
          node.position.set(0, 0, 0);
          wrapper.position.set(...p.meshData.basePosition);
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(p.meshData.color),
            metalness: Math.min(0.9, p.meshData.metalness),
            roughness: Math.max(0.25, p.meshData.roughness),
            side: THREE.DoubleSide
          });
          node.traverse((c) => {
            if (c instanceof THREE.Mesh) {
              if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => m.dispose());
              c.material = mat;
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });
          wrapper.add(node);
          this.modelRoot.add(wrapper);
          this.registerPart(p.id, wrapper);
        });
        disposeObject(gltf.scene);
        this.finishLoad();
      },
      undefined,
      () => {
        if (this.disposed) return;
        this.callbacks.onLoadState?.('error', 'Não foi possível baixar o modelo 3D. Verifique a conexão e tente de novo, ou use a ilustração 2D.');
        this.requestRender();
      }
    );
  }

  /** Geometria gerada no navegador: não depende de download. */
  private loadProcedural() {
    if (this.config.source === 'glb') return;
    const { root, parts, environment, animate } = PROCEDURAL_BUILDERS[this.config.source](this.quality);
    this.animator = animate ?? this.spinAnimator(parts);
    this.modelRoot.add(root);
    this.environment.add(environment);
    environment.userData.removable = true;
    parts.forEach((g, id) => this.registerPart(id, g));
    this.finishLoad();
  }

  /** Giro em torno do eixo X das peças de `spinParts` (rotor, eixo...), para modelos sem animação própria. */
  private spinAnimator(parts: Map<string, THREE.Object3D>): ((dt: number) => void) | null {
    const spin = (this.config.spinParts || []).map((id) => parts.get(id)).filter((g): g is THREE.Object3D => !!g);
    if (!spin.length) return null;
    return (dt) => spin.forEach((g) => (g.rotation.x = (g.rotation.x + dt * Math.PI * 1.6) % (Math.PI * 2)));
  }

  /**
   * .glb com uma peça por nó (`extras.partId`), já nas coordenadas da cena (as mesmas do modelo procedural,
   * então trajetórias e vista explodida continuam valendo). Mantém os materiais PBR do arquivo.
   * Se o download falhar, carrega o modelo procedural sem mostrar erro ao aluno.
   */
  private loadPartsGlb(url: string) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      url,
      (gltf) => {
        if (this.disposed) {
          disposeObject(gltf.scene);
          return;
        }
        const parts = new Map<string, THREE.Object3D>();
        [...gltf.scene.children].forEach((node) => {
          const id = node.userData?.partId as string | undefined;
          node.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              dequantize(o.geometry);
              o.castShadow = !!id;
              o.receiveShadow = true;
            }
          });
          if (id && this.machine.parts.some((p) => p.id === id)) {
            const g = new THREE.Group();
            g.name = id;
            g.add(node);
            this.modelRoot.add(g);
            parts.set(id, g);
          } else if (node.name === 'environment') {
            const env = new THREE.Group();
            env.add(node);
            env.userData.removable = true;
            this.environment.add(env);
          } else {
            disposeObject(node);
          }
        });
        const missing = this.machine.parts.filter((p) => !parts.has(p.id)).map((p) => p.id);
        if (missing.length) {
          console.warn('[lab3d] .glb sem as peças', missing, '— usando o modelo procedural');
          this.clearModel();
          this.partsGlbFailed = true;
          this.loadProcedural();
          return;
        }
        this.loadedFromGlb = true;
        this.animator = this.spinAnimator(parts);
        parts.forEach((g, id) => this.registerPart(id, g as THREE.Group));
        this.finishLoad();
      },
      undefined,
      () => {
        if (this.disposed) return;
        console.warn('[lab3d] não foi possível baixar', url, '— usando o modelo procedural');
        this.partsGlbFailed = true;
        this.loadProcedural();
      }
    );
  }

  /**
   * Junta as malhas de uma peça que usam o mesmo material em uma só (menos chamadas de desenho).
   * A peça continua selecionável como um todo, que é o que o laboratório precisa.
   */
  private mergePartMeshes(group: THREE.Group) {
    group.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
    const byMaterial = new Map<THREE.Material, { geos: THREE.BufferGeometry[]; cast: boolean }>();
    const toRemove: THREE.Mesh[] = [];
    group.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || Array.isArray(o.material)) return;
      const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(
        new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)
      );
      Object.keys(g.attributes).forEach((k) => {
        if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
      });
      if (!g.attributes.normal) g.computeVertexNormals();
      const entry = byMaterial.get(o.material) || { geos: [], cast: false };
      entry.geos.push(g);
      entry.cast = entry.cast || o.castShadow;
      byMaterial.set(o.material, entry);
      toRemove.push(o);
    });
    if (toRemove.length <= byMaterial.size) {
      byMaterial.forEach((e) => e.geos.forEach((g) => g.dispose()));
      return;
    }
    toRemove.forEach((m) => {
      m.parent?.remove(m);
      m.geometry.dispose();
    });
    // Remove grupos internos que ficaram vazios
    [...group.children].forEach((c) => {
      if (!(c instanceof THREE.Mesh) && c.children.length === 0) group.remove(c);
    });
    byMaterial.forEach((entry, mat) => {
      const merged = mergeGeometries(entry.geos, false);
      entry.geos.forEach((g) => g.dispose());
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = entry.cast;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
  }

  private registerPart(id: string, group: THREE.Group) {
    this.mergePartMeshes(group);
    this.parts.set(id, group);
    this.basePos.set(id, group.position.clone());
    this.poseOffset.set(id, new THREE.Vector3());
    const mats: THREE.MeshStandardMaterial[] = [];
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.userData.partId = id;
        // Cada peça recebe materiais próprios, para destacar uma sem afetar as outras.
        const src = o.material as THREE.MeshStandardMaterial;
        let own = mats.find((m) => m.userData.srcUuid === src.uuid);
        if (!own) {
          own = src.clone();
          own.userData.srcUuid = src.uuid;
          mats.push(own);
          this.originalEmissive.set(own, {
            color: own.emissive.clone(),
            intensity: own.emissiveIntensity,
            opacity: own.opacity,
            transparent: own.transparent,
            depthWrite: own.depthWrite
          });
        }
        o.material = own;
      }
    });
    this.materialsByPart.set(id, mats);
  }

  private finishLoad() {
    this.poses = buildPoses(this.config.disassembly, Array.from(this.parts.keys()));
    this.poseIndex = 0;
    this.computeAnchorsAndFrame();
    this.applyPositions();
    this.applyVisualState();
    this.callbacks.onLoadState?.('loaded');
    this.requestRender();
  }

  private computeAnchorsAndFrame() {
    this.modelRoot.updateMatrixWorld(true);
    const all = new THREE.Box3();
    this.parts.forEach((g, id) => {
      const box = new THREE.Box3().setFromObject(g);
      all.union(box);
      // O enquadramento também cobre a vista explodida, para nenhuma peça sair da tela.
      const ex = this.config.explode[id];
      if (ex) all.union(box.clone().translate(new THREE.Vector3(...ex)));
      // ...e as posições das peças retiradas durante a desmontagem.
      this.poses.forEach((pose) => {
        const off = pose[id];
        if (off && (off[0] || off[1] || off[2])) all.union(box.clone().translate(new THREE.Vector3(...off)));
      });
      const c = box.getCenter(new THREE.Vector3());
      // Âncora do rótulo no topo da peça, relativa à posição montada
      const anchor = new THREE.Vector3(c.x, box.max.y + 0.12, c.z).sub(g.position);
      this.labelAnchors.set(id, anchor);
    });
    if (all.isEmpty()) return;
    const sphere = all.getBoundingSphere(new THREE.Sphere());
    this.modelRadius = sphere.radius;
    const target = sphere.center.clone();
    target.y = Math.max(target.y, -0.2);
    const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(this.perspCamera.fov / 2)) * 0.82;
    const dir = new THREE.Vector3(...CAMERA_DIRS.iso).normalize();
    this.homeCamera.target.copy(target);
    this.homeCamera.position.copy(target).addScaledVector(dir, dist);
    this.homeDistance = dist;
    this.orthoHalfH = dist * Math.tan(THREE.MathUtils.degToRad(this.perspCamera.fov / 2));
    for (const cam of [this.perspCamera, this.orthoCamera]) {
      cam.near = Math.max(0.05, dist / 100);
      cam.far = dist * 20;
    }
    this.perspCamera.updateProjectionMatrix();
    this.updateOrthoFrustum();
    if (this.controls) {
      this.controls.minDistance = sphere.radius * 0.5;
      this.controls.maxDistance = dist * 2.5;
    }
    this.setView('iso', false);
  }

  private clearModel() {
    this.anims = [];
    this.animator = null;
    this.running = false;
    this.parts.clear();
    this.basePos.clear();
    this.poseOffset.clear();
    this.materialsByPart.forEach((mats) => mats.forEach((m) => m.dispose()));
    this.materialsByPart.clear();
    this.originalEmissive.clear();
    this.labelAnchors.clear();
    [...this.modelRoot.children].forEach((c) => {
      this.modelRoot.remove(c);
      disposeObject(c);
    });
    [...this.environment.children].forEach((c) => {
      if (c.userData.removable) {
        this.environment.remove(c);
        disposeObject(c);
      }
    });
  }

  /* ───────────────────────── Renderização sob demanda ───────────────────────── */

  public requestRender = () => {
    this.needsRender = true;
    if (this.frame === null && !this.disposed) {
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number) => {
    this.frame = null;
    if (this.disposed || !this.renderer) return;
    // Tempo real decorrido (limitado a 0,25 s): animações duram o mesmo em computadores rápidos ou lentos.
    const dt = Math.min(0.25, (now - this.lastTime) / 1000);
    this.lastTime = now;
    let active = false;

    // Mede o intervalo real entre quadros seguidos (inclui o trabalho da GPU).
    if (this.lastActiveTick && now - this.lastActiveTick < 1000) {
      this.activeTicksSinceLoad++;
      if (this.activeTicksSinceLoad > 15) this.trackFrameInterval(now - this.lastActiveTick);
    }

    const controlsMoving = this.controls?.update() ?? false;
    if (controlsMoving) active = true;

    if (Math.abs(this.explodeT - this.explodeTarget) > 0.0005) {
      const k = this.reducedMotion ? 1 : 1 - Math.pow(0.0015, dt);
      this.explodeT += (this.explodeTarget - this.explodeT) * k;
      if (Math.abs(this.explodeT - this.explodeTarget) <= 0.0005) this.explodeT = this.explodeTarget;
      active = true;
    }

    if (this.running && this.animator) {
      this.animator(dt);
      active = true;
    }

    if (this.anims.length) {
      let finished = false;
      this.anims.forEach((a) => {
        a.t = this.reducedMotion ? 1 : Math.min(1, a.t + dt / a.duration);
        this.poseOffset.get(a.partId)?.copy(samplePath(a.path, easeInOut(a.t)));
      });
      if (this.anims.every((a) => a.t >= 1)) {
        this.anims = [];
        finished = true;
      }
      active = true;
      if (finished) {
        this.applyVisualState();
        this.callbacks.onAnimationDone?.();
      }
    }

    if (active || this.needsRender) {
      if (this.anims.length || this.explodeT !== this.explodeTarget || this.shadowDirty) {
        this.renderer.shadowMap.needsUpdate = true;
        this.shadowDirty = false;
      }
      this.applyPositions();
      const t0 = performance.now();
      this.renderer.render(this.scene, this.camera);
      this.trackRenderTime(performance.now() - t0);
      this.updateLabels();
      this.needsRender = false;
    }
    this.lastActiveTick = active ? now : 0;
    if (active && this.frame === null) this.frame = requestAnimationFrame(this.tick);
  };

  private trackRenderTime(ms: number) {
    this.renderTimes.push(ms);
    if (this.renderTimes.length > 30) this.renderTimes.shift();
  }

  private trackFrameInterval(ms: number) {
    this.frameIntervals.push(ms);
    if (this.frameIntervals.length > 40) this.frameIntervals.shift();
    if (!this.slowReported && this.quality === 'high' && this.frameIntervals.length >= 20) {
      const avg = this.frameIntervals.reduce((a, b) => a + b, 0) / this.frameIntervals.length;
      // Abaixo de ~20 quadros por segundo durante interação, sugere o modo leve.
      if (avg > 50) {
        this.slowReported = true;
        this.callbacks.onSlowDevice?.(avg);
      }
    }
  }

  /** Média recente do tempo de renderização por quadro (ms), para diagnóstico. */
  public getStats() {
    const n = this.renderTimes.length;
    return {
      avgRenderMs: n ? this.renderTimes.reduce((a, b) => a + b, 0) / n : 0,
      avgFrameIntervalMs: this.frameIntervals.length ? this.frameIntervals.reduce((a, b) => a + b, 0) / this.frameIntervals.length : 0,
      samples: n,
      calls: this.renderer?.info.render.calls ?? 0,
      triangles: this.renderer?.info.render.triangles ?? 0,
      geometries: this.renderer?.info.memory.geometries ?? 0,
      textures: this.renderer?.info.memory.textures ?? 0
    };
  }

  private applyPositions() {
    this.parts.forEach((g, id) => {
      const base = this.basePos.get(id)!;
      const pose = this.poseOffset.get(id)!;
      const ex = this.config.explode[id] || [0, 0, 0];
      const n = this.nudges.get(id);
      g.position.set(
        base.x + pose.x + ex[0] * this.explodeT + (n?.[0] ?? 0),
        base.y + pose.y + ex[1] * this.explodeT + (n?.[1] ?? 0),
        base.z + pose.z + ex[2] * this.explodeT + (n?.[2] ?? 0)
      );
    });
  }

  private resize() {
    if (!this.renderer) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.perspCamera.aspect = w / h;
    this.perspCamera.updateProjectionMatrix();
    this.updateOrthoFrustum();
  }

  private updateOrthoFrustum() {
    const o = this.orthoCamera;
    const a = this.perspCamera.aspect;
    o.left = -this.orthoHalfH * a;
    o.right = this.orthoHalfH * a;
    o.top = this.orthoHalfH;
    o.bottom = -this.orthoHalfH;
    o.updateProjectionMatrix();
  }

  private get isOrtho() {
    return this.camera === this.orthoCamera;
  }

  /** Distância "equivalente" da câmera ao alvo (na ortográfica, vem do zoom). */
  private viewDistance(): number {
    if (this.isOrtho) return this.homeDistance / this.orthoCamera.zoom;
    return this.controls ? this.camera.position.distanceTo(this.controls.target) : this.homeDistance;
  }

  private cancelFlight = () => {
    this.flightToken++;
    if (this.flight !== null) cancelAnimationFrame(this.flight);
    this.flight = null;
  };

  /**
   * Leva a câmera até o alvo, olhando na direção `dir` (do alvo para a câmera), na distância indicada.
   * A direção é interpolada junto com o alvo, então a câmera faz um arco em vez de cortar caminho pelo modelo.
   */
  private flyTo(target: THREE.Vector3, dir: THREE.Vector3, distance: number, ms: number) {
    const controls = this.controls;
    if (!controls) return;
    this.cancelFlight();
    const min = controls.minDistance;
    const max = controls.maxDistance;
    const endDist = THREE.MathUtils.clamp(distance, min, max);
    const startTarget = controls.target.clone();
    const startDir = this.camera.position.clone().sub(startTarget).normalize();
    const endDir = dir.clone().normalize();
    const startDist = this.viewDistance();
    const apply = (k: number) => {
      const t = startTarget.clone().lerp(target, k);
      const d = startDir.clone().lerp(endDir, k);
      if (d.lengthSq() < 1e-6) d.copy(endDir);
      d.normalize();
      const dist = startDist + (endDist - startDist) * k;
      if (this.isOrtho) {
        this.orthoCamera.zoom = this.homeDistance / dist;
        this.orthoCamera.updateProjectionMatrix();
        // Na ortográfica a distância não muda o tamanho; a câmera fica longe para não cortar peças.
        this.camera.position.copy(t).addScaledVector(d, Math.max(dist, this.homeDistance));
      } else {
        this.camera.position.copy(t).addScaledVector(d, dist);
      }
      controls.target.copy(t);
      controls.update();
      this.requestRender();
    };
    if (ms <= 0 || this.reducedMotion) {
      apply(1);
      return;
    }
    const start = performance.now();
    const token = this.flightToken;
    const step = () => {
      if (this.disposed || token !== this.flightToken) return;
      const k = easeInOut(Math.min(1, (performance.now() - start) / ms));
      apply(k);
      this.flight = k < 1 ? requestAnimationFrame(step) : null;
    };
    this.flight = requestAnimationFrame(step);
  }

  /* ───────────────────────── Rótulos HTML ───────────────────────── */

  private updateLabels() {
    if (!this.labelLayer || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const v = new THREE.Vector3();
    const placed: { el: HTMLElement; x: number; y: number; w: number; h: number }[] = [];
    this.labelLayer.querySelectorAll<HTMLElement>('[data-part-label]').forEach((el) => {
      const id = el.dataset.partLabel!;
      const g = this.parts.get(id);
      const anchor = this.labelAnchors.get(id);
      const show =
        g &&
        anchor &&
        g.visible &&
        (this.labelsVisible || id === this.selectedId || id === this.hoveredId || id === this.targetId);
      if (!show) {
        el.style.opacity = '0';
        return;
      }
      v.copy(anchor!).add(g!.position).applyMatrix4(this.modelRoot.matrixWorld).project(this.camera);
      if (v.z > 1) {
        el.style.opacity = '0';
        return;
      }
      el.dataset.state = id === this.selectedId ? 'selected' : id === this.targetId ? 'target' : 'normal';
      placed.push({ el, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, w: el.offsetWidth, h: el.offsetHeight });
    });

    // Evita rótulos sobrepostos: de baixo para cima, sobe cada rótulo até não encostar nos já posicionados.
    placed.sort((a, b) => b.y - a.y);
    const done: typeof placed = [];
    const GAP = 3;
    for (const p of placed) {
      let moved = true;
      for (let guard = 0; moved && guard < placed.length; guard++) {
        moved = false;
        for (const q of done) {
          const overlapX = Math.abs(p.x - q.x) < (p.w + q.w) / 2 + GAP;
          const overlapY = p.y > q.y - q.h - GAP && p.y - p.h < q.y + GAP;
          if (overlapX && overlapY) {
            p.y = q.y - q.h - GAP;
            moved = true;
          }
        }
      }
      p.y = Math.max(p.h + 2, p.y);
      done.push(p);
      p.el.style.opacity = '1';
      p.el.style.transform = `translate(-50%, -100%) translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    }
  }

  /* ───────────────────────── Interação ───────────────────────── */

  private onPointerDown = (e: PointerEvent) => {
    this.downPos = { x: e.clientX, y: e.clientY };
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.downPos) return;
    const moved = Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y);
    this.downPos = null;
    if (moved > 6 || e.button !== 0) return; // foi arrasto de câmera, não clique
    const id = this.pick(e);
    if (id) this.callbacks.onSelect?.(id);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || this.downPos) return;
    this.lastPointerEvent = e;
    if (this.hoverQueued) return;
    this.hoverQueued = true;
    requestAnimationFrame(() => {
      this.hoverQueued = false;
      if (!this.lastPointerEvent || this.disposed) return;
      const id = this.pick(this.lastPointerEvent);
      if (id !== this.hoveredId) {
        this.hoveredId = id;
        if (this.renderer) this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
        this.applyVisualState();
        this.callbacks.onHover?.(id);
      }
    });
  };

  private onPointerLeave = () => {
    if (this.hoveredId) {
      this.hoveredId = null;
      this.applyVisualState();
      this.callbacks.onHover?.(null);
    }
  };

  private pick(e: PointerEvent): string | null {
    if (!this.renderer) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.modelRoot, true);
    for (const h of hits) {
      const id = h.object.userData.partId as string | undefined;
      if (!id || !h.object.visible) continue;
      // Peças em raio-X deixam o clique "atravessar" para as internas
      if ((this.xray && this.isXrayCandidate(id)) || this.xrayParts.has(id)) continue;
      // A metade cortada não aparece, então o clique passa por ela
      if (this.isCut(id) && h.point.z > 0) continue;
      return id;
    }
    // Se só havia peças transparentes no caminho, aceita a primeira
    const first = hits.find((h) => h.object.userData.partId && h.object.visible);
    return (first?.object.userData.partId as string) ?? null;
  }

  /* ───────────────────────── Estado visual ───────────────────────── */

  private isCut(id: string) {
    return this.cutaway && Boolean(this.config.cutawayParts?.includes(id));
  }

  private isXrayCandidate(id: string) {
    const part = this.machine.parts.find((p) => p.id === id);
    return part?.category === 'structural' && id !== this.selectedId && id !== this.targetId;
  }

  private applyVisualState() {
    this.parts.forEach((g, id) => {
      g.visible = !this.hidden.has(id) && (!this.isolatedId || this.isolatedId === id);
      const ghost = (this.xray && this.isXrayCandidate(id)) || (this.xrayParts.has(id) && id !== this.selectedId);
      const highlight = id === this.selectedId || id === this.hoveredId;
      const target = id === this.targetId;
      (this.materialsByPart.get(id) || []).forEach((m) => {
        const o = this.originalEmissive.get(m)!;
        if (highlight) {
          m.emissive.copy(HIGHLIGHT);
          m.emissiveIntensity = id === this.selectedId ? 0.32 : 0.18;
        } else if (target) {
          m.emissive.copy(TARGET);
          m.emissiveIntensity = 0.3;
        } else {
          m.emissive.copy(o.color);
          m.emissiveIntensity = o.intensity;
        }
        const transparent = ghost || o.transparent;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.needsUpdate = true;
        }
        m.opacity = ghost ? 0.16 : o.opacity;
        m.depthWrite = ghost ? false : o.depthWrite;
        const planes = this.isCut(id) ? [this.clipPlane] : null;
        if ((m.clippingPlanes?.length ?? 0) !== (planes?.length ?? 0)) {
          m.clippingPlanes = planes;
          m.needsUpdate = true;
        }
      });
      g.traverse((c) => {
        if (c instanceof THREE.Mesh) c.castShadow = !ghost;
      });
    });
    this.shadowDirty = true;
    this.requestRender();
  }

  /* ───────────────────────── API pública ───────────────────────── */

  public getPartIds() {
    return Array.from(this.parts.keys());
  }

  public select(id: string | null) {
    this.selectedId = id;
    this.applyVisualState();
  }

  public setTarget(id: string | null) {
    this.targetId = id;
    this.applyVisualState();
  }

  public setXray(on: boolean) {
    this.xray = on;
    this.applyVisualState();
  }

  /** Vista em corte das peças de carcaça listadas em `config.cutawayParts`. */
  public setCutaway(on: boolean) {
    this.cutaway = on && Boolean(this.config.cutawayParts?.length);
    if (this.renderer) this.renderer.localClippingEnabled = this.cutaway;
    this.applyVisualState();
  }

  public setLabelsVisible(on: boolean) {
    this.labelsVisible = on;
    this.requestRender();
  }

  public setHidden(ids: string[]) {
    this.hidden = new Set(ids);
    this.applyVisualState();
  }

  /** Desloca peças da posição montada (a peça fica visivelmente fora do lugar). Lista vazia devolve tudo. */
  public setNudges(nudges: Record<string, Vec3>) {
    this.nudges = new Map(Object.entries(nudges));
    this.applyPositions();
    this.requestRender();
  }

  public setIsolated(id: string | null) {
    this.isolatedId = id;
    this.applyVisualState();
  }

  public setExplode(t: number) {
    this.explodeTarget = Math.max(0, Math.min(1, t));
    this.requestRender();
  }

  /** Vai direto para a pose depois de `index` etapas de desmontagem (sem animação). */
  public jumpToPose(index: number) {
    this.anims = [];
    this.poseIndex = Math.max(0, Math.min(this.poses.length - 1, index));
    const pose = this.poses[this.poseIndex] || {};
    this.parts.forEach((_, id) => this.poseOffset.get(id)?.set(...((pose[id] || [0, 0, 0]) as Vec3)));
    this.shadowDirty = true;
    this.xrayParts.clear();
    this.applyVisualState();
  }

  /** Anima a remoção (direction = 1) ou a reinstalação (direction = −1) da etapa informada. */
  public animateStep(stepIndex: number, direction: 1 | -1) {
    const step: ProcedureStep | undefined = this.config.disassembly[stepIndex];
    if (!step) return;
    const from = this.poses[direction === 1 ? stepIndex : stepIndex + 1];
    this.anims = Object.entries(step.moves).map(([id, path]) => {
      const start = new THREE.Vector3(...((from?.[id] || [0, 0, 0]) as Vec3));
      const waypoints = path.map((p) => new THREE.Vector3(...p));
      let full: THREE.Vector3[];
      if (direction === 1) {
        full = [start, ...waypoints];
      } else {
        // Caminho inverso: da posição removida de volta à posição anterior
        const prevPose = this.poses[stepIndex]?.[id] || [0, 0, 0];
        full = [...waypoints].reverse();
        full.push(new THREE.Vector3(...(prevPose as Vec3)));
      }
      const length = full.reduce((acc, p, i) => (i ? acc + p.distanceTo(full[i - 1]) : 0), 0);
      return { partId: id, path: full, t: 0, duration: Math.min(2.4, 0.7 + length * 0.28) };
    });
    this.poseIndex = direction === 1 ? stepIndex + 1 : stepIndex;
    this.xrayParts = new Set(step.xrayParts || []);
    this.applyVisualState();
  }

  /** Liga/desliga a simulação de operação (só tem efeito em modelos com animação de operação). */
  public setRunning(on: boolean) {
    this.running = on && !!this.animator;
    // Modelos que deslocam peças em operação voltam para a posição montada ao parar.
    if (!this.running && this.parts.size) this.applyPositions();
    this.requestRender();
  }

  public get canRun() {
    return !!this.animator;
  }

  public isAnimating() {
    return this.anims.length > 0;
  }

  public setView(view: CameraView, animate = true) {
    if (!this.controls) return;
    const dir = new THREE.Vector3(...CAMERA_DIRS[view]);
    if (!animate) {
      // Primeiro enquadramento: posiciona direto (sem arco a partir da posição padrão da câmera).
      this.cancelFlight();
      this.camera.position.copy(this.homeCamera.target).addScaledVector(dir.normalize(), this.homeDistance);
      this.controls.target.copy(this.homeCamera.target);
      if (this.isOrtho) {
        this.orthoCamera.zoom = 1;
        this.orthoCamera.updateProjectionMatrix();
      }
      this.controls.update();
      this.requestRender();
      return;
    }
    this.flyTo(this.homeCamera.target.clone(), dir, this.homeDistance, 600);
  }

  public resetCamera() {
    this.setView('iso');
  }

  /**
   * Enquadra um grupo de peças (ou o modelo inteiro, com `partIds` vazio) olhando de `dir`,
   * com transição suave. `fill` > 1 afasta a câmera. Usado pelo modo apresentação.
   */
  public frameParts(partIds: string[] | null, dir: CameraView | Vec3, opts: { fill?: number; ms?: number; poses?: number[] } = {}) {
    const d = new THREE.Vector3(...(typeof dir === 'string' ? CAMERA_DIRS[dir] : dir));
    const fill = opts.fill ?? 1;
    const ms = opts.ms ?? 1400;
    const ids = (partIds || []).filter((id) => this.parts.has(id));
    if (!ids.length) {
      this.flyTo(this.homeCamera.target.clone(), d, this.homeDistance * fill, ms);
      return;
    }
    this.modelRoot.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const origin = this.modelRoot.localToWorld(new THREE.Vector3());
    ids.forEach((id) => {
      const g = this.parts.get(id)!;
      const now = new THREE.Box3().setFromObject(g);
      if (!opts.poses?.length) {
        box.union(now);
        return;
      }
      // Enquadra a peça nas posições que ela terá nas poses pedidas (ex.: antes e depois de uma etapa).
      const current = g.position.clone().sub(this.basePos.get(id)!);
      opts.poses.forEach((pi) => {
        const off = new THREE.Vector3(...((this.poses[pi]?.[id] || [0, 0, 0]) as Vec3)).sub(current);
        const shift = this.modelRoot.localToWorld(off).sub(origin);
        box.union(now.clone().translate(shift));
      });
    });
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const dist = (Math.max(0.4, sphere.radius) / Math.sin(THREE.MathUtils.degToRad(this.perspCamera.fov / 2))) * 0.9 * fill;
    this.flyTo(sphere.center, d, dist, ms);
  }

  /** Alterna entre perspectiva e projeção ortográfica, mantendo o enquadramento atual. */
  public setProjection(ortho: boolean) {
    const controls = this.controls;
    if (!controls || ortho === this.isOrtho) return;
    this.cancelFlight();
    const target = controls.target;
    const dist = this.viewDistance();
    const dir = this.camera.position.clone().sub(target).normalize();
    if (ortho) {
      this.orthoCamera.zoom = this.homeDistance / dist;
      this.orthoCamera.position.copy(target).addScaledVector(dir, Math.max(dist, this.homeDistance));
      this.orthoCamera.quaternion.copy(this.perspCamera.quaternion);
      this.updateOrthoFrustum();
      this.camera = this.orthoCamera;
    } else {
      this.perspCamera.position.copy(target).addScaledVector(dir, dist);
      this.camera = this.perspCamera;
    }
    controls.object = this.camera;
    controls.update();
    this.requestRender();
  }

  public get orthographic() {
    return this.isOrtho;
  }

  public zoom(factor: number) {
    if (!this.controls) return;
    this.cancelFlight();
    const t = this.controls.target;
    const dist = THREE.MathUtils.clamp(this.viewDistance() * factor, this.controls.minDistance, this.controls.maxDistance);
    if (this.isOrtho) {
      this.orthoCamera.zoom = this.homeDistance / dist;
      this.orthoCamera.updateProjectionMatrix();
    } else {
      this.camera.position.copy(t).add(this.camera.position.clone().sub(t).setLength(dist));
    }
    this.controls.update();
    this.requestRender();
  }

  public rotate(angle: number) {
    if (!this.controls) return;
    this.cancelFlight();
    const t = this.controls.target;
    const offset = this.camera.position.clone().sub(t).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    this.camera.position.copy(t).add(offset);
    this.controls.update();
    this.requestRender();
  }

  /** Centraliza a câmera na peça indicada (transição suave, mantendo o ângulo de visão). */
  public focusPart(id: string) {
    const g = this.parts.get(id);
    if (!g || !this.controls) return;
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    const dir = this.camera.position.clone().sub(this.controls.target);
    const r = Math.max(0.8, box.getBoundingSphere(new THREE.Sphere()).radius);
    this.flyTo(c, dir, THREE.MathUtils.clamp(r * 3.2, this.controls.minDistance, this.modelRadius * 3), 600);
  }

  public dispose() {
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.cancelFlight();
    this.resizeObserver?.disconnect();
    if (this.renderer) {
      const el = this.renderer.domElement;
      el.removeEventListener('pointerdown', this.onPointerDown);
      el.removeEventListener('pointerup', this.onPointerUp);
      el.removeEventListener('pointermove', this.onPointerMove);
      el.removeEventListener('pointerleave', this.onPointerLeave);
    }
    this.controls?.removeEventListener('change', this.requestRender);
    this.controls?.removeEventListener('start', this.cancelFlight);
    this.controls?.dispose();
    this.clearModel();
    disposeObject(this.scene);
    this.envTexture?.dispose();
    this.pmrem?.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
  }

  public get usesGlb() {
    return this.loadedFromGlb;
  }
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments || o instanceof THREE.Line) {
      o.geometry?.dispose();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m: THREE.Material) => {
        Object.values(m).forEach((v) => {
          if (v instanceof THREE.Texture) v.dispose();
        });
        m.dispose();
      });
    }
  });
}

/**
 * Converte atributos quantizados (KHR_mesh_quantization: Int16/Int8 normalizados) para Float32.
 * `mergePartMeshes` reaplica matrizes nas posições; num Int16 normalizado os valores seriam cortados em ±1.
 */
function dequantize(geo: THREE.BufferGeometry) {
  (['position', 'normal'] as const).forEach((name) => {
    const a = geo.getAttribute(name);
    if (!a || (a.array instanceof Float32Array && !(a as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute)) return;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    geo.setAttribute(name, new THREE.BufferAttribute(out, a.itemSize));
  });
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Amostra uma polilinha pelo comprimento (t de 0 a 1). */
function samplePath(path: THREE.Vector3[], t: number): THREE.Vector3 {
  if (path.length === 1) return path[0].clone();
  const lengths = path.slice(1).map((p, i) => p.distanceTo(path[i]));
  const total = lengths.reduce((a, b) => a + b, 0);
  if (total === 0) return path[path.length - 1].clone();
  let d = t * total;
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] ? Math.min(1, d / lengths[i]) : 1;
      return path[i].clone().lerp(path[i + 1], k);
    }
    d -= lengths[i];
  }
  return path[path.length - 1].clone();
}
