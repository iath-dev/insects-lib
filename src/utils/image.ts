import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export async function loadModel() {
  try {
    const model = await mobilenet.load();
    return model;
  } catch (error) {
    console.error("Error loading the model:", error);
    throw error;
  }
}

export function preprocesImage(image: ImageData) {
    const tensor = tf.browser
      .fromPixels(image)
      .resizeNearestNeighbor([224, 224]) // MobileNet input size
      .toFloat()
      .expandDims();
    return tensor.div(127.5).sub(1); // Normalize to [-1, 1] range
  }
