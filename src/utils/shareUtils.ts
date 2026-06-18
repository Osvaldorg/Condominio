import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Share, Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Comparte un código QR en formato Base64 como una imagen nativa (.png).
 * Si no hay Base64 disponible, comparte únicamente el mensaje de texto.
 *
 * @param base64String Cadena Base64 devuelta por el backend (ej: "data:image/png;base64,...")
 * @param textMessage Mensaje predeterminado que acompaña o sustituye al QR
 */
export async function shareQrImage(base64String: string | null | undefined, textMessage: string) {
  try {
    // Si no tenemos imagen, hacemos fallback al texto simple nativo de React Native
    if (!base64String) {
      await Share.share({ message: textMessage });
      return;
    }

    // Asegurarnos de tener el módulo Sharing disponible en este dispositivo nativo
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      // Fallback a texto si el dispositivo (simulador, web) no soporta compartir nativo
      await Share.share({ message: textMessage });
      return;
    }

    // Limpiar el prefijo "data:image/...;base64," si viene incorporado del backend
    const parts = base64String.split('base64,');
    let base64Code = parts.length > 1 ? parts[1] : parts[0];

    // Eliminar saltos de línea ocultos y espacios, que rompen el decodificador nativo
    base64Code = base64Code.replace(/\s/g, '');

    // Generar una ruta temporal segura asegurando la barra invertida/slash final
    const folder = FileSystem.cacheDirectory?.endsWith('/')
      ? FileSystem.cacheDirectory
      : `${FileSystem.cacheDirectory}/`;

    const fileName = `QR_Acceso_${Date.now()}.png`;
    const fileUri = `${folder}${fileName}`;

    // Escribir el Base64 directamente a un archivo de disco
    await FileSystem.writeAsStringAsync(fileUri, base64Code, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (Platform.OS === 'ios') {
      // En iOS, el componente nativo Share de React Native soporta enviar Imagen + Texto simultáneamente sin fallas
      await Share.share({
        url: fileUri,
        message: textMessage,
      });
    } else {
      // Android ignora el texto adjunto en los intents de imagen mediante expo-sharing.
      // Solución recomendada (Best Practice): Copiar silenciosamente el texto al portapapeles nativo para un "Pegado" fácil.
      await Clipboard.setStringAsync(textMessage);
      
      ToastAndroid.show("Texto copiado al portapapeles. ¡Pégalo en el chat!", ToastAndroid.LONG);

      // En Android, dependemos de Expo Sharing (Intent)
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: textMessage, // Fallback por si la app intercepta el título (Raro)
      });
    }

    // Opcional: Podría limpiarse el caché aquí eliminando `fileUri`,
    // pero iOS/Android manejan el `cacheDirectory` de forma segura.

  } catch (error) {
    console.warn("Error al compartir QR:", error);
    Alert.alert("Error al compartir", "No se pudo preparar la imagen para compartir. Intentando compartir como texto.");
    // Último recurso en caso de error de FileSystem
    await Share.share({ message: textMessage });
  }
}
