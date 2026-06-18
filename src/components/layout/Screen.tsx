import { SafeAreaView, StyleSheet, ViewProps } from 'react-native';

export const Screen = ({ children, style, ...props }: ViewProps) => {
    return <SafeAreaView style={[styles.screen, style]} {...props}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#fff' },
});
