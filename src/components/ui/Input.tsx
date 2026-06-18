import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export const Input = (props: TextInputProps) => {
    return <TextInput style={styles.input} placeholderTextColor="#999" {...props} />;
};

const styles = StyleSheet.create({
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
});
