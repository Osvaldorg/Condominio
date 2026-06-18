import { useLocalSearchParams } from "expo-router";
import VisitDetailScreen from "../../src/modules/visits/screens/VisitDetailScreen";

export default function VisitDetailRoute() {
  const { id } = useLocalSearchParams();
  return <VisitDetailScreen id={id as string} />;
}
