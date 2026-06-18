import { Stack } from "expo-router";

export default function PaymentsLayout() {
  // Solo maneja el index (FinancesScreen).
  // Las pantallas de detalle (charge-detail, payment-detail, etc.)
  // viven en /payments/* — Root Stack — sin tab bar.
  return <Stack screenOptions={{ headerShown: false }} />;
}
