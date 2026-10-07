export class ForbiddenError extends Error {
  readonly permission: string;
  constructor(permission: string) {
    super(`Forbidden: falta a permissão ${permission}`);
    this.name = "ForbiddenError";
    this.permission = permission;
  }
}

/** Mensagem humana padrão pra ações negadas (usada nas Server Actions). */
export function deniedMessage(): string {
  return "Você não tem permissão para esta ação.";
}
