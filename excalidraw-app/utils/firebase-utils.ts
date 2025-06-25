import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getSceneVersion } from "@excalidraw/element";
import { encryptData } from "@excalidraw/excalidraw/data/encryption";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

// Configuración de Firebase (debe coincidir con .env.development)
const FIREBASE_CONFIG = JSON.parse(import.meta.env.VITE_APP_FIREBASE_CONFIG);

// Inicializar Firebase
const app = initializeApp(FIREBASE_CONFIG);
const firestore = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Autenticación anónima
signInAnonymously(auth)
  .then(() => {
    console.log("Successfully signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously: ", error);
  });

export const saveToFirebase = async (
  scene: {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
  },
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const sceneVersion = getSceneVersion(scene.elements);
  
  // Generar clave segura (32 bytes = 256 bits)
  // Generar clave criptográfica directamente
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // Exportar clave en formato raw para almacenamiento
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const roomKey = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Cifrar elementos
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(scene.elements))
  );

  const ciphertext = new Uint8Array(encryptedData);
  
  // Sanitizar appState - eliminar campos no serializables
  const sanitizedAppState = {...scene.appState};
  
  // Lista de campos que no se pueden serializar
  const nonSerializableFields = [
    'collaborators',  // Map
    'followedBy',     // Set
    'socket'          // Objeto WebSocket
  ];
  
  nonSerializableFields.forEach(field => {
    if (field in sanitizedAppState) {
      delete (sanitizedAppState as any)[field];
    }
  });
  
  const sceneData = {
    sceneVersion,
    ciphertext: Array.from(ciphertext),
    iv: Array.from(iv),
    appState: sanitizedAppState,
    createdAt: serverTimestamp()
  };

  // Guardar en Firestore
  const docRef = doc(firestore, "standaloneScenes", roomKey);
  
  try {
    await setDoc(docRef, sceneData); // Removed merge: true as it's not needed for new documents and can sometimes cause issues with security rules
    console.log("Document written with ID: ", roomKey);
    onSuccess();
  } catch (error: any) {
    console.error("Error adding document: ", error);
    
    // Log detailed error info
    console.log("Document data:", sceneData);
    console.log("Data size:", JSON.stringify(sceneData).length);
    
    onError(error);
  }
};