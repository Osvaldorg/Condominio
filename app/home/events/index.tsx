import EventsScreen from "../../../src/modules/events/screens/EventsScreen";
import { Stack } from "expo-router";

export default function HomeEventsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Mis Eventos" }} />
      <EventsScreen />
    </>
  );
}
