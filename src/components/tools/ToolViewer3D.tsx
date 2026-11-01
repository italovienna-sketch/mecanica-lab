import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { PROCEDURAL_TOOL_MODELS } from './models/measuringTools';
import { buildFastenerModel } from './models/fasteners';
import { createStudioEnvironment } from '../three/studioEnvironment';

/**
 * Ferramentas com modelo 3D: arquivos .glb em public/assets/models/tools ou modelos gerados no código
 * (paquímetro e micrômetro). As demais usam só o desenho 2D.
 * Os .glb novos vêm do pipeline Blender (asset-pipeline/): peças com `extras.partId`, geometria comprimida com meshopt.
 */
export const TOOLS_WITH_3D_MODEL = ['chave-combinada', 'chave-allen', 'chave-boca', 'chave-estrela', 'chave-fenda-phillips', 'alicate-universal', 'chave-inglesa', 'soquete-catraca', 'torquimetro', 'martelo-face-macia', 'alicate-aneis', 'saca-polias', 'extrator-rolamentos', 'relogio-comparador', ...Object.keys(PROCEDURAL_TOOL_MODELS)];

interface ToolViewer3DProps {
  toolId: string;
  /** Descrição acessível do modelo. */
  label?: string;
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}

export const ToolViewer3D: React.FC<ToolViewer3DProps> = ({
  toolId,
  label = 'Modelo 3D da ferramenta',
  selectedPartId,
  onSelectPart
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const partGroupsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const outlineRef = useRef<OutlinePass | null>(null);
  // Renderiza só quando algo muda (câmera, seleção, tamanho) — economiza GPU e bateria.
  const needsRenderRef = useRef(true);
  const homeRef = useRef(new THREE.Vector3(0, 1.6, 3.6));
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadTick, setReloadTick] = useState(0);

  // Destaque da peça selecionada: contorno âmbar (não altera o material — tingir faria o aço parecer cobre)
  // e as demais peças levemente mais escuras, para dar foco.
  useEffect(() => {
    const selected = selectedPartId !== null ? partGroupsRef.current.get(selectedPartId) : undefined;
    partGroupsRef.current.forEach((obj) => {
      obj.traverse((child) => {
        const mat = (child as THREE.Mesh).isMesh ? ((child as THREE.Mesh).material as THREE.MeshStandardMaterial) : null;
        if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = selected && obj !== selected ? 0.7 : 1;
      });
    });
    if (outlineRef.current) outlineRef.current.selectedObjects = selected ? [selected] : [];
    needsRenderRef.current = true;
  }, [selectedPartId, loadState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let animId = 0;

    setLoadState('loading');
    partGroupsRef.current.clear();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 220);

    const scene = new THREE.Scene();
    // Grafite de estúdio (o OutputPass aplica tone mapping também ao fundo, por isso o tom é mais claro que o cartão).
    scene.background = new THREE.Color(0x2a2c2f);

    const grid = new THREE.GridHelper(6, 12, 0x4c4f53, 0x383b3f);
    grid.position.y = -0.85;
    scene.add(grid);

    // Sombra de contato barata (textura radial), dá peso ao objeto sem custo de mapa de sombras.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, 'rgba(0,0,0,0.75)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.3)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85 })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.renderOrder = -1;
    scene.add(contactShadow);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 1.6, 3.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Mesmo mapeamento de tons usado na revisão do Blender (Khronos PBR Neutral): cores e metais fiéis.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Pós-processamento só para o contorno de seleção. Alvo com MSAA (samples: 4) mantém as bordas suaves.
    const pr = renderer.getPixelRatio();
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(width * pr, height * pr, { samples: 4, type: THREE.HalfFloatType })
    );
    composer.addPass(new RenderPass(scene, camera));
    const outline = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outline.visibleEdgeColor.set(0xffa53a);
    outline.hiddenEdgeColor.set(0x7a4a14);
    outline.edgeStrength = 4;
    outline.edgeThickness = 1;
    outline.edgeGlow = 0;
    composer.addPass(outline);
    composer.addPass(new OutputPass()); // aplica o tone mapping e a conversão para sRGB
    outlineRef.current = outline;

    // Reflexos de estúdio (softboxes): sem contraste no ambiente, aço e cromado parecem plástico cinza.
    const envTexture = createStudioEnvironment(renderer);
    scene.environment = envTexture;
    scene.environmentIntensity = 1.0;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.5;
    controls.maxDistance = 7;
    controlsRef.current = controls;
    controls.addEventListener('change', () => {
      needsRenderRef.current = true;
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dir1.position.set(4, 6, 4);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dir2.position.set(-4, -2, -3);
    scene.add(dir2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const placeModel = (model: THREE.Object3D) => {
        rootGroup.add(model);
        // Enquadra a câmera no tamanho real do modelo (cada arquivo tem uma escala diferente).
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const radius = size.length() / 2 || 1;
        model.position.sub(center);
        // Distância para caber na largura e na altura da tela (instrumentos longos, como o paquímetro, ficam bem enquadrados).
        const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
        const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
        const dist = Math.max(size.y / 2 / Math.tan(vHalf), Math.max(size.x, size.z) / 2 / Math.tan(hHalf), radius * 0.8) * 1.12 + size.z / 2;
        // Peças deitadas (chaves, fixadores planos) são vistas mais de cima; instrumentos em pé, mais de frente.
        const lyingFlat = size.y < 0.25 * Math.max(size.x, size.z);
        const elevation = THREE.MathUtils.degToRad(lyingFlat ? 48 : 26);
        homeRef.current = new THREE.Vector3(0, dist * Math.sin(elevation), dist * Math.cos(elevation));
        camera.position.copy(homeRef.current);
        camera.near = dist / 100;
        camera.far = dist * 10;
        camera.updateProjectionMatrix();
        controls.minDistance = radius * 0.6;
        controls.maxDistance = dist * 3;
        grid.position.y = -size.y / 2 - Math.max(size.length() * 0.002, 0.0005);
        grid.scale.setScalar((Math.max(size.x, size.z) * 1.4) / 6);
        contactShadow.position.y = -size.y / 2 - Math.max(size.length() * 0.001, 0.0002);
        contactShadow.scale.set(size.x * 1.25 + radius * 0.15, size.z * 1.6 + radius * 0.15, 1);
        controls.target.set(0, 0, 0);
        controls.update();
        needsRenderRef.current = true;
        setLoadState('ready');
    };

    const procedural = PROCEDURAL_TOOL_MODELS[toolId]?.() ?? buildFastenerModel(toolId);
    if (procedural) {
      // Modelo gerado no navegador: as peças já vêm como grupos com userData.partId.
      const model = procedural;
      model.children.forEach((child) => {
        if (child.userData.partId) partGroupsRef.current.set(child.userData.partId, child);
      });
      placeModel(model);
    } else {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      loader.load(
        `/assets/models/tools/${toolId}.glb`,
        (gltf) => {
          if (isDisposed) return;
          const model = gltf.scene;
          // Cada malha recebe material próprio (o destaque de seleção altera o material).
          model.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh && mesh.material) mesh.material = (mesh.material as THREE.Material).clone();
          });
          // Peças: modelos do pipeline Blender trazem extras.partId (vira userData.partId);
          // os .glb antigos usam o nome da malha.
          let hasExtras = false;
          model.traverse((node) => {
            if (typeof node.userData?.partId === 'string') {
              hasExtras = true;
              partGroupsRef.current.set(node.userData.partId, node);
            }
          });
          if (!hasExtras) {
            model.traverse((node) => {
              if (node.name && (node as THREE.Mesh).isMesh) {
                node.userData.partId = node.name;
                partGroupsRef.current.set(node.name, node);
              }
            });
          }
          placeModel(model);
        },
        undefined,
        () => {
          if (!isDisposed) {
            setLoadState('error');
          }
        }
      );
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(rootGroup.children, true);
      if (hits.length > 0) {
        let curr: THREE.Object3D | null = hits[0].object;
        while (curr) {
          if (curr.userData?.partId) {
            onSelectPart(curr.userData.partId);
            break;
          }
          curr = curr.parent;
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const resizeObs = new ResizeObserver(() => {
      if (!container || isDisposed) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      needsRenderRef.current = true;
    });
    resizeObs.observe(container);

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);
      controls.update();
      if (needsRenderRef.current) {
        needsRenderRef.current = false;
        composer.render();
      }
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      envTexture.dispose();
      shadowTex.dispose();
      outline.dispose();
      composer.dispose();
      outlineRef.current = null;
      renderer.dispose();
    };
  }, [toolId, reloadTick]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(homeRef.current);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border border-ink-800 bg-ink-900 sm:h-80">
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" aria-label={label} role="img" />

      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900/80 text-sm text-ink-300">Carregando modelo 3D…</div>
      )}

      {loadState === 'error' && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-900/95 p-4 text-center">
          <span className="text-sm text-ink-200">Não foi possível carregar o modelo 3D. Use a aba “Desenho” ou tente de novo.</span>
          <button onClick={() => setReloadTick((t) => t + 1)} className="btn-secondary">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Tentar novamente
          </button>
        </div>
      )}

      <button onClick={handleResetCamera} className="btn-secondary absolute right-2 top-2 px-2.5 py-1.5 text-xs" aria-label="Centralizar a câmera">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Centralizar
      </button>
      <p className="pointer-events-none absolute bottom-2 left-3 text-xs text-ink-400">Arraste para girar · role para aproximar · clique numa parte</p>
    </div>
  );
};
