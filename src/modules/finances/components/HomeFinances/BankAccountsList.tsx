import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BankAccount } from "../../../../api/types/finances";

interface BankAccountsListProps {
  accounts: BankAccount[];
}

export function BankAccountsList({ accounts }: BankAccountsListProps) {
  const [showAccounts, setShowAccounts] = useState(false);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  if (!accounts || accounts.length === 0) return null;

  const mainAccount = accounts[0];
  const secondaryAccounts = accounts.slice(1);

  return (
    <View className="bg-[#1E1E24] px-4 py-3 flex-col">
      <View className="flex-row items-center justify-between">
        
        <Pressable 
          className="flex-row items-center py-1 flex-1 mr-4 active:opacity-70"
          onPress={() => {
             if (secondaryAccounts.length > 0) {
               setShowAccounts(!showAccounts);
             }
          }}
        >
          <Text className="text-neutral-200 text-[14px] font-medium mr-1" numberOfLines={1}>
            {mainAccount.banco} {mainAccount.tipo_cuenta ? `· ${mainAccount.tipo_cuenta}` : ''}
          </Text>
          {secondaryAccounts.length > 0 && (
            <MaterialCommunityIcons 
              name={showAccounts ? "chevron-up" : "chevron-down"} 
              size={18} 
              color="#D4D4D8" 
            />
          )}
        </Pressable>

        <Pressable 
          onPress={() => copyToClipboard(mainAccount.numero_cuenta)}
          className="bg-[#141418] rounded-[10px] px-2.5 py-1.5 flex-row items-center active:bg-[#2A2A30] active:opacity-50"
        >
          <Text className="text-neutral-300 text-[13px] font-medium mr-2">
            {mainAccount.numero_cuenta}
          </Text>
          <MaterialCommunityIcons name="content-copy" size={14} color="#A1A1AA" />
        </Pressable>
        
      </View>

      {/* Expanded secondary accounts */}
      {showAccounts && secondaryAccounts.length > 0 && (
        <View className="mt-3 pt-2 border-t border-neutral-700">
          {secondaryAccounts.map((account) => (
            <View 
              key={account._id}
              className="flex-row justify-between items-center py-2"
            >
              <Text className="text-neutral-200 text-[14px] font-medium flex-1 mr-4" numberOfLines={1}>
                {account.banco} {account.tipo_cuenta ? `· ${account.tipo_cuenta}` : ''}
              </Text>
              
              <Pressable 
                onPress={() => copyToClipboard(account.numero_cuenta)}
                className="bg-[#141418] rounded-[10px] px-2.5 py-1.5 flex-row items-center active:bg-[#2A2A30] active:opacity-50"
              >
                <Text className="text-neutral-300 text-[13px] font-medium mr-2">
                  {account.numero_cuenta}
                </Text>
                <MaterialCommunityIcons name="content-copy" size={14} color="#A1A1AA" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

    </View>
  );
}
