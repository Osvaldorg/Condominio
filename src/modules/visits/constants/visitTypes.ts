export const VISIT_TYPES = {
  vip: {
    id: "698120d8a56555737b452af1",
    nombre: "visitante_vip",
    label: "Acceso preferente VIP",
  },
  unicaVez: {
    id: "698120d8a56555737b452af2",
    nombre: "unica_vez",
    label: "Acceso a invitado personal",
  },
  proveedor: {
    id: "698120d8a56555737b452af3",
    nombre: "proveedor",
    label: "Acceso a proveedor / servicio",
  },
  personal: {
    id: "698120d8a56555737b452af4",
    nombre: "personal",
    label: "Acceso a personal (doméstico, etc)",
  },
  evento: {
    id: "698120d8a56555737b452af5",
    nombre: "evento",
    label: "Múltiples visitas (Evento)",
  },
} as const;

export type VisitTypeKey = keyof typeof VISIT_TYPES;
