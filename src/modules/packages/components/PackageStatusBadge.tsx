import { Text, View } from "react-native";
import { PackageStatus } from "../../../api/types/packages";

interface Props {
  status: PackageStatus;
}

export function PackageStatusBadge({ status }: Props) {
  const getStatusConfig = () => {
    switch (status) {
      case "por_retirar":
        return { label: "Por retirar", bg: "bg-orange-100", text: "text-orange-700" };
      case "notificado":
        return { label: "Notificado", bg: "bg-blue-100", text: "text-blue-700" };
      case "retirado":
        return { label: "Entregado", bg: "bg-green-100", text: "text-green-700" };
      case "eliminado":
        return { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" };
      default:
        return { label: status, bg: "bg-neutral-100", text: "text-neutral-700" };
    }
  };

  const config = getStatusConfig();

  return (
    <View className={`px-2 py-1 rounded-full ${config.bg} self-start`}>
      <Text className={`text-[10px] font-bold uppercase ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
