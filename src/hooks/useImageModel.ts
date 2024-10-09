import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

// Definir los tipos para el hook
interface UseImageModelReturn {
  predictFromFile: (file: File) => Promise<void>;
  prediction: string | null;
  isLoading: boolean;
  error: string | null;
}

const useImageModel = (): UseImageModelReturn => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);

  // Cargar el modelo de TensorFlow desde la carpeta public/models
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        const loadedModel = await tf.loadLayersModel('/models/tfjs_model/model.json');
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
        .div(tf.scalar(255)) // Normalizar los valores de píxeles a [0, 1]
        .expandDims(); // Agregar una dimensión para batch

      const predictionTensor = model.predict(tensorImage) as tf.Tensor;
      const predictionArray = Array.from(predictionTensor.dataSync()); // Convertir el tensor a un array

      const classNames = ['Butterfly', 'Dragonfly', 'Grasshopper', 'Ladybird', 'Mosquito']

      console.log({predictionArray});

      // Obtener el índice de la clase con la mayor predicción
      const maxIndex = predictionArray.indexOf(Math.max(...predictionArray));
      console.log(classNames[maxIndex]); // Asumir que classNames es tu lista de clases

      setPrediction(classNames[maxIndex]);

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
