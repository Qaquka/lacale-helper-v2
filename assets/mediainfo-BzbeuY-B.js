/**
 * Fallback MediaInfo chunk.
 *
 * This file is intentionally committed to keep static exports coherent when
 * deploying the HTTrack snapshot (index + assets) on static hosts.
 */

export async function analyzeFile() {
  throw new Error(
    'Le module MediaInfo complet est indisponible dans cette exportation statique. '
    + 'Utilisez un NFO texte ou republiez un build complet incluant le chunk MediaInfo.'
  );
}

export function mediaInfoToNfoFormat() {
  return {
    raw: '',
    isXML: false,
    video: null,
    audio: [],
    subtitles: [],
    general: {},
    errors: ['Module MediaInfo indisponible dans cette version déployée'],
    warnings: ['Analyse vidéo désactivée : chunk MediaInfo manquant dans l’export original']
  };
}
