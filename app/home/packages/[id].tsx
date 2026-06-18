import { PackageDetailScreen } from "../../../src/modules/packages/screens/PackageDetailScreen";
import { Stack } from "expo-router";

export default function PackageDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Detalle del paquete" }} />
      <PackageDetailScreen />
    </>
  );
}
