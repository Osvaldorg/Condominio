import { create } from "zustand";
import type { Authorization, CurrentVisit } from "../../../api/types/visits";
import { visitsApi } from "../../../api/endpoints/visits.api";
import type { VisitTypeKey } from "../constants/visitTypes";

type VisitDraft = {
  typeKey: "vip" | "unicaVez" | "proveedor" | "personal" | "evento" | null;
  tipo_visita_id: string | null;
  proveedor_id: string | null;
  personal_id: string | null;

  nombre_visitante: string;

  isMultiDay: boolean;

  // VIP & Proveedor:
  fecha_inicio_vigencia: string | null; // YYYY-MM-DD
  fecha_fin_vigencia: string | null;
  es_preferente: boolean;
  accesos_ilimitados: boolean;

  // Única vez:
  es_visita_unica: boolean;
  fecha_visita_unica: string | null; // YYYY-MM-DD

  // Personal:
  diasSemana: number[];
};


type VisitsState = {
  draft: VisitDraft;
  generated: Authorization | null;
  currentVisits: CurrentVisit[];

  setCurrentVisits: (visits: CurrentVisit[]) => void;
  fetchCurrentVisits: () => Promise<void>;

  setType: (typeKey: VisitTypeKey, tipo_visita_id: string) => void;
  setNombre: (nombre: string) => void;
  setProveedorId: (id: string) => void;
  setPersonalId: (id: string) => void;
  setIsMultiDay: (val: boolean) => void;

  setVipDates: (inicioISO: string, finISO: string) => void;
  setUnicaVezDate: (fechaISO: string) => void;
  setDiasSemana: (dias: number[]) => void;

  setGenerated: (a: Authorization) => void;
  resetDraft: () => void;
};

const emptyDraft: VisitDraft = {
  typeKey: null,
  tipo_visita_id: null,
  proveedor_id: null,
  personal_id: null,

  nombre_visitante: "",

  isMultiDay: false,

  fecha_inicio_vigencia: null,
  fecha_fin_vigencia: null,
  es_preferente: true,
  accesos_ilimitados: true,

  es_visita_unica: false,
  fecha_visita_unica: null,
  diasSemana: [],
};


export const useVisitsStore = create<VisitsState>((set) => ({
  draft: emptyDraft,
  generated: null,
  currentVisits: [],

  setCurrentVisits: (currentVisits) => set({ currentVisits }),
  
  fetchCurrentVisits: async () => {
    try {
      const res = await visitsApi.getCurrentVisits();
      if (res.success) {
        set({ currentVisits: res.visitas_actuales || [] });
      }
    } catch (error) {
      console.error("Error fetching current visits from store:", error);
    }
  },

  setType: (typeKey, tipo_visita_id) =>
    set({
      draft: {
        ...emptyDraft,
        typeKey,
        tipo_visita_id,
      },
      generated: null,
    }),

  setNombre: (nombre_visitante) => set((s) => ({ draft: { ...s.draft, nombre_visitante } })),
  
  setProveedorId: (proveedor_id) => set((s) => ({ draft: { ...s.draft, proveedor_id } })),

  setPersonalId: (personal_id) => set((s) => ({ draft: { ...s.draft, personal_id } })),

  setIsMultiDay: (isMultiDay) => set((s) => ({ draft: { ...s.draft, isMultiDay } })),

  setVipDates: (fecha_inicio_vigencia, fecha_fin_vigencia) =>
    set((s) => ({ draft: { ...s.draft, fecha_inicio_vigencia, fecha_fin_vigencia } })),

  setUnicaVezDate: (fecha_visita_unica) =>
    set((s) => ({ draft: { ...s.draft, fecha_visita_unica } })),

  setDiasSemana: (diasSemana) =>
    set((s) => ({ draft: { ...s.draft, diasSemana } })),

  setGenerated: (generated) => set({ generated }),

  resetDraft: () => set({ draft: emptyDraft, generated: null }),
}));
