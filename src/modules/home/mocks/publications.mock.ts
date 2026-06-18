import type { Publication } from "../../../api/types/publications";

export const mockPublications: Publication[] = [
  {
    _id: "1",
    titulo: "Mantenimiento de alberca",
    contenido: "El área de alberca estará en mantenimiento el día viernes de 9am a 3pm.",
    tipo_destinatario: "todos",
    fecha_publicacion: "2026-02-01T09:00:00Z",
    autor: {
      nombre: "Administración",
      rol: "administrador",
    },
    leida: false,
    fecha_lectura: null,
  },
  {
    _id: "2",
    titulo: "Recordatorio de pago",
    contenido: "Les recordamos que el pago de mantenimiento vence el día 5 de cada mes.",
    tipo_destinatario: "todos",
    fecha_publicacion: "2026-01-28T14:00:00Z",
    autor: {
      nombre: "Comité",
      rol: "comite",
    },
    leida: true,
    fecha_lectura: "2026-01-29T10:30:00Z",
  },
  {
    _id: "3",
    titulo: "Evento comunitario",
    contenido: "Están invitados al evento comunitario este sábado en el área común.",
    tipo_destinatario: "calle_torre",
    calle_torre: "Privada del Bosque",
    fecha_publicacion: "2026-01-27T18:00:00Z",
    autor: {
      nombre: "Administración",
      rol: "administrador",
    },
    leida: false,
    fecha_lectura: null,
  },
];
