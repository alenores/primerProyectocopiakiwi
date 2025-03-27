import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Configurar AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Sube un archivo a S3
 * @param {Buffer} buffer - El buffer del archivo
 * @param {string} originalName - Nombre original del archivo
 * @param {string} folder - Carpeta donde se guardará (opcional)
 * @returns {Promise<string>} - URL del archivo subido
 */
export const uploadToS3 = async (buffer, originalName, folder = '') => {
  try {
    // Generar un nombre único para el archivo
    const fileExtension = originalName.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${uuidv4()}.${fileExtension}`;
    
    // Configurar los parámetros para S3
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ACL: 'public-read',
      ContentType: `image/${fileExtension === 'svg' ? 'svg+xml' : fileExtension}`
    };
    
    // Subir el archivo a S3
    const result = await s3.upload(params).promise();
    
    // Retornar la URL del archivo subido
    return result.Location;
  } catch (error) {
    console.error('Error al subir archivo a S3:', error);
    throw new Error('Error al subir el archivo a S3');
  }
};

/**
 * Elimina un archivo de S3
 * @param {string} fileUrl - URL completa del archivo a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteFromS3 = async (fileUrl) => {
  try {
    // Extraer el nombre del archivo de la URL
    const key = fileUrl.split('/').slice(3).join('/');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    // Eliminar el archivo de S3
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo de S3:', error);
    throw new Error('Error al eliminar el archivo de S3');
  }
};

export default {
  uploadToS3,
  deleteFromS3
};
