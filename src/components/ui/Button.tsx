import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

export const Button = ({ title, loading, style, disabled, ...props }: ButtonProps) => {
    return (
        <TouchableOpacity 
            style={[styles.button, disabled && styles.disabled, style]} 
            disabled={disabled || loading} 
            {...props}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    disabled: { opacity: 0.6 },
    text: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
