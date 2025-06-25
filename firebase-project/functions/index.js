const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.saveExcalidrawScene = async (data, context) => {
  const db = getFirestore();

  try {
    await db.collection("standaloneScenes").doc(data.roomKey).set(data.sceneData);
    console.log("Document written with ID: ", data.roomKey);
    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: error.message };
  }
};