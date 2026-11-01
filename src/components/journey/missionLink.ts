import type { MissionId } from '../../data/journey/meta';

/**
 * Ida e volta entre uma ordem de serviço e o Laboratório 3D. Fica na sessão da aba: se sumir, o laboratório abre normal,
 * no modo que já tinha (por isso cada leitura e escrita aceita falhar).
 */
const KEY = 'mecanica_lab_mission_link';

export interface MissionLink {
  missionId: MissionId;
  code: string;
  labStage: string;
}

export function setMissionLink(link: MissionLink) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(link));
  } catch {
    /* sem armazenamento, o laboratório só não mostra o atalho de volta */
  }
}

export function getMissionLink(): MissionLink | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MissionLink) : null;
  } catch {
    return null;
  }
}

export function clearMissionLink() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nada a limpar */
  }
}
