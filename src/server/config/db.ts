import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise: Promise<boolean> | null = null;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    isConnected = false;

    if (
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL === '1'
    ) {
      throw new Error('MONGODB_URI is not configured');
    }

    console.warn(
      '[Database] MONGODB_URI is not set. Local development will use document-file fallback.'
    );

    return false;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const maskedUri = uri.replace(
    /\/\/[^:]+:[^@]+@/,
    '//***:***@'
  );

  console.log(
    `[Database] Connecting to MongoDB Atlas: ${maskedUri}`
  );

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      isConnected = true;

      console.log(
        '[Database] Successfully connected to MongoDB Atlas.'
      );

      return true;
    })
    .catch((error) => {
      isConnected = false;
      connectionPromise = null;

      console.error(
        '[Database] MongoDB connection failed:',
        (error as Error).message
      );

      if (
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL === '1'
      ) {
        throw error;
      }

      console.warn(
        '[Database] Falling back to local document storage for local development.'
      );

      return false;
    });

  return connectionPromise;
};

export const getDBStatus = () => {
  return {
    connected:
      isConnected &&
      mongoose.connection.readyState === 1,

    isAtlas: isConnected,

    readyState:
      mongoose.connection.readyState,
  };
};
