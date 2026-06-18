import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useChat } from '../../src/modules/chat/hooks/useChat';
import { useEffect } from 'react';

export default function TabsLayout() {
    const { fetchUnreadCounts, unreadAdminCount, unreadCasetaCount } = useChat();

    useEffect(() => {
        fetchUnreadCounts();

        const intervalId = setInterval(() => {
            fetchUnreadCounts();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchUnreadCounts]);

    const totalUnread = unreadAdminCount + unreadCasetaCount;
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: false }}>
            <Tabs.Screen 
                name="home" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
                }} 
            />
            <Tabs.Screen 
                name="payments" 
                options={{ 
                    title: "Pagos",
                    tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} />
                }} 
            />
            <Tabs.Screen 
                name="visits" 
                options={{ 
                    title: "Visitas",
                    tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />
                }} 
            />
            <Tabs.Screen 
                name="chat" 
                options={{ 
                    title: "Chat",
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
                    tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
                }} 
            />
            <Tabs.Screen 
                name="notifications" 
                options={{ 
                    title: "Notificaciones",
                    tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />
                }} 
            />
        </Tabs>
    );
}
