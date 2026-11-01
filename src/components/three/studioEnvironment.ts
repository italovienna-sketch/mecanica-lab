import * as THREE from 'three';

/**
 * Ambiente de estúdio para metais (fotografia de produto): sala escura com softboxes.
 * Metal polido reflete o ambiente; numa sala cinza uniforme (RoomEnvironment) ele parece plástico fosco.
 * Aqui há contraste — faixas de luz brilhantes e áreas escuras — e as arestas chanfradas "acendem".
 * Gerado uma vez com PMREM (sem download de HDRI). Devolve a textura; quem chama deve descartá-la.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();

  // Sala: degradê vertical (teto e piso de estúdio claros, horizonte escuro — dá contraste aos reflexos)
  const room = new THREE.SphereGeometry(10, 32, 16);
  const colors: number[] = [];
  const pos = room.attributes.position;
  const top = new THREE.Color(0x60656d);
  const horizon = new THREE.Color(0x2b2d32);
  const bottom = new THREE.Color(0x3c3f44);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y > 0) c.copy(horizon).lerp(top, y);
    else c.copy(horizon).lerp(bottom, -y);
    colors.push(c.r, c.g, c.b);
  }
  room.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const roomMesh = new THREE.Mesh(room, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
  env.add(roomMesh);

  const softbox = (w: number, h: number, intensity: number, position: [number, number, number], tint = 0xffffff) => {
    const m = new THREE.MeshBasicMaterial({ color: tint, side: THREE.DoubleSide });
    m.color.multiplyScalar(intensity); // valores > 1: luz HDR no PMREM
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
    return mesh;
  };
  // Faces horizontais vistas de cima a ~25–50° refletem a região "acima e atrás": é onde fica a luz principal.
  softbox(18, 4.5, 3.0, [0, 6.6, -6.4]); // principal (reflexo nas faces planas, largo para peças compridas)
  softbox(12, 9, 1.4, [0, 9, 0]); // teto difuso grande
  softbox(1.4, 7, 3.2, [-8.5, 2, 2], 0xeef4ff); // faixa lateral esquerda (fria) — acende os chanfros
  softbox(1.4, 7, 2.6, [8.5, 1.5, -1], 0xfff4e6); // faixa lateral direita (quente)
  softbox(16, 5, 1.5, [0, -3.5, 8]); // piso claro à frente: faces verticais voltadas para a câmera refletem aqui

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });
  return tex;
}
