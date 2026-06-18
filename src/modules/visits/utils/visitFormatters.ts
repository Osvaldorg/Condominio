export const getVisitTypeLabel = (dbTipoNombre?: string) => {
  switch (dbTipoNombre) {
    case "visitante_vip":
      return "Acceso preferente VIP";
    case "unica_vez":
      return "Invitado personal (única vez)";
    case "proveedor":
      return "Proveedor / Servicio";
    case "personal":
      return "Acceso personal (doméstico, etc)";
    case "evento":
      return "Evento";
    default:
      return "Visita Autorizada";
  }
};
