/**
 * Retorna um font-size que escala com a preferência do usuário no botão Aa.
 * Multiplica o valor base pelo CSS var --text-scale (definida em globals.css).
 *
 * Uso:
 *   style={{ fontSize: fs(44) }}    // hero
 *   style={{ fontSize: fs(13) }}    // body
 *   style={{ fontSize: fs(10) }}    // microcopy
 */
export function fs(px: number): string {
  return `calc(${px}px * var(--text-scale))`;
}
