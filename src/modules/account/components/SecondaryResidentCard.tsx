import React from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SecondaryResidentCardProps {
  resident: any;
  onToggle: (id: string, currentStatus: string) => void;
}

export function SecondaryResidentCard({ resident, onToggle }: SecondaryResidentCardProps) {
  const isActivo = resident.estatus === 'activo';
  const name = `${resident.user_id?.nombre || ''} ${resident.user_id?.apellido || ''}`;

  return (
    <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center mr-3">
          <Text className="text-neutral-600 font-bold">
            {resident.user_id?.nombre?.[0] || 'R'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-neutral-800" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-xs text-neutral-500" numberOfLines={1}>
            {resident.user_id?.email}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center ml-4">
        <Text className={`text-[10px] font-bold uppercase mr-2 ${isActivo ? 'text-green-600' : 'text-neutral-400'}`}>
          {isActivo ? 'Activo' : 'Inactivo'}
        </Text>
        <Switch
          value={isActivo}
          onValueChange={() => onToggle(resident._id, resident.estatus)}
          trackColor={{ false: "#E5E5E5", true: "#10b981" }}
          thumbColor={"#FFFFFF"}
        />
      </View>
    </View>
  );
}
