import { useState } from "react";
import { eventsApi } from "../../../api/endpoints/events.api";
import { useVisitsStore } from "../store/visits.store";

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setGenerated = useVisitsStore((s) => s.setGenerated);

  const submit = async (payload: {
    nombre_evento: string;
    descripcion: string;
    ubicacion: string;
    fecha_inicio: string;
    fecha_fin: string;
    max_invitados: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      if (!payload.nombre_evento.trim()) throw new Error("El nombre de evento es requerido");
      if (!payload.fecha_inicio || !payload.fecha_fin) throw new Error("Fechas inválidas");

      const res = await eventsApi.createEvent({
        ...payload,
        es_qr_compartido: true,
      });

      if (!res.success) {
        throw new Error(res.message || "No se pudo crear el evento");
      }

      // Store in generated so QrScreen can pick it up.
      // We'll reuse the `generated` logic from Visits but adapt it for Events by
      // mocking the properties `_id` and `qr_code`.
      setGenerated({
        _id: res.evento._id,
        nombre_visitante: res.evento.nombre_evento, // Usamos el campo para el título
        fecha_inicio_vigencia: res.evento.fecha_inicio,
        fecha_fin_vigencia: res.evento.fecha_fin,
        qr_code: res.qr_compartido || res.evento.codigo_qr_evento,
        limite_ingresos: res.evento.max_invitados,
      } as any);

      return true;
    } catch (e: any) {
      setError(e?.message ?? "Error al crear evento");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
