import { PackagesScreen } from "../../../src/modules/packages/screens/PackagesScreen";
import { Stack } from "expo-router";

export default function PackagesRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Mis Paquetes" }} />
      <PackagesScreen />
    </>
  );
}
