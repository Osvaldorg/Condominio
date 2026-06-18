import { useState } from "react";
import { visitsApi } from "../../../api/endpoints/visits.api";
import { addDaysYYYYMMDD } from "../../../utils/date";
import { useVisitsStore } from "../store/visits.store";


export function useCreateVisit() {
  const draft = useVisitsStore((s) => s.draft);
  const setGenerated = useVisitsStore((s) => s.setGenerated);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!draft.tipo_visita_id) throw new Error("Selecciona un tipo de visita");
      if (!draft.nombre_visitante.trim()) throw new Error("Ingresa el nombre del visitante");

      const isVip = draft.typeKey === "vip";
      const isUnica = draft.typeKey === "unicaVez";
      const isProveedor = draft.typeKey === "proveedor";
      const isPersonal = draft.typeKey === "personal";

      if (isVip || isProveedor || isPersonal) {
        if (!draft.tipo_visita_id) throw new Error("Falta tipo_visita_id");
        if (isProveedor && !draft.proveedor_id) throw new Error("Falta provider ID");
        if (isPersonal && !draft.personal_id) throw new Error("Falta personal ID");
        if (!draft.nombre_visitante.trim()) throw new Error("Ingresa el nombre del visitante");
        if (!draft.fecha_inicio_vigencia || !draft.fecha_fin_vigencia)
            throw new Error("Selecciona fechas de vigencia");

        let res: any;

        if (isPersonal) {
            res = await visitsApi.createPersonalAuthorization({
                personal_id: draft.personal_id as string,
                // Añadimos hora de inicio local
                fecha_inicio: `${draft.fecha_inicio_vigencia}T00:00:00`,
                // Añadimos hora final en modo LOCAL (sin Z) para evitar desfase UTC
                fecha_fin: `${draft.fecha_fin_vigencia}T23:59:59`,
                dias_semana: draft.diasSemana,
            });
        } else {
            const payload: any = {
                tipo_visita_id: draft.tipo_visita_id,
                ...(isProveedor ? { proveedor_id: draft.proveedor_id as string } : {}),
                nombre_visitante: draft.nombre_visitante.trim(),
                fecha_inicio_vigencia: `${draft.fecha_inicio_vigencia}T00:00:00`,
                // Si son varios días, se vence a las 23:59 local (sin la Z de UTC)
                fecha_fin_vigencia: `${draft.fecha_fin_vigencia}T23:59:59`,
                es_preferente: draft.es_preferente,
                accesos_ilimitados: draft.accesos_ilimitados,
            };

            // Reactivando la coerción "visita unica" (pase de un día) pero sumando fecha_visita_unica
            if (draft.fecha_inicio_vigencia === draft.fecha_fin_vigencia) {
                payload.es_visita_unica = true;
                payload.fecha_visita_unica = `${draft.fecha_inicio_vigencia}T00:00:00`;
            }

            res = await visitsApi.createAuthorization(payload);
        }

        if (!res.success) throw new Error(res.message || "No se pudo crear la visita");

        // Aquí guardamos TODO para QR
        setGenerated({
            ...res.autorizacion,
            qr_code: res.qr_code ?? res.autorizacion?.qr_code,
            codigo_acceso: res.text_code ?? res.autorizacion?.codigo_acceso,
        });

        return;
      }

      if (isUnica) {
        if (!draft.fecha_visita_unica) throw new Error("Selecciona la fecha de visita");

        const fecha = draft.fecha_visita_unica;

        const res = await visitsApi.createAuthorization({
          tipo_visita_id: draft.tipo_visita_id,
          nombre_visitante: draft.nombre_visitante.trim(),

          es_visita_unica: true,
          fecha_visita_unica: `${fecha}T00:00:00`,

          // 👇 para pasar el validador sin mostrarlo en UI
          fecha_inicio_vigencia: `${fecha}T00:00:00`,
          fecha_fin_vigencia: `${addDaysYYYYMMDD(fecha, 1)}T23:59:59`,

          // opcional pero recomendable (por claridad)
          limite_ingresos: 1,
        } as any);

        if (!res.success) throw new Error(res.message || "No se pudo crear la visita");

        // 👇 Normaliza igual que VIP
        setGenerated({
          ...res.autorizacion,
          qr_code: res.qr_code ?? res.autorizacion.qr_code,
          codigo_acceso: res.text_code ?? res.autorizacion.codigo_acceso,
        });

        return;
      }

      throw new Error("Tipo de visita no soportado todavía");
    } catch (e: any) {
      setError(e?.message ?? "Error al crear visita");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
