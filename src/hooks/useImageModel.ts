import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import json_model from '@/models/mobilenet_js_model/model.json';

// Definir los tipos para el hook
interface UseImageModelReturn {
  predictFromFile: (file: File) => Promise<void>;
  prediction: number[] | null;
  isLoading: boolean;
  error: string | null;
}

const useImageModel = (): UseImageModelReturn => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number[] | null>(null);

  // Cargar el modelo de TensorFlow desde la carpeta public/models
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);

        console.log('Cargando modelo...', 'model.src')
        const loadedModel = await tf.loadLayersModel('/models/mobilenetv2/model.json');
        console.log('Modelo cargado', loadedModel)
        setModel(loadedModel);
      } catch (err) {
        setError('Error al cargar el modelo');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  // Función para procesar el archivo de imagen y hacer la predicción
  const predictFromFile = useCallback(async (file: File) => {
    if (!model) return;

    try {
      setIsLoading(true);

      // Crear un objeto URL para leer el archivo
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;

      // Esperar a que la imagen se cargue
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      // Procesar la imagen para que sea compatible con el modelo
      const tensorImage = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([224, 224]) // Ajustar tamaño según el modelo
        .toFloat()
        .expandDims(); // Agregar una dimensión para batch

      const predictionTensor = model.predict(tensorImage) as tf.Tensor;
      const predictionArray = Array.from(predictionTensor.dataSync()); // Convertir el tensor a un array

      console.log(predictionArray);
      setPrediction(predictionArray);

      // Liberar el objeto URL cuando ya no se necesite
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      setError('Error al procesar la imagen');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [model]);

  return { predictFromFile, prediction, isLoading, error };
};

export default useImageModel;
