import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] MONGODB_URI is not set in environment. Running with local persistent document storage.');
    return false;
  }

  // Mask credentials for safe logging
  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`[Database] Attempting connection to MongoDB Atlas: ${maskedUri}`);

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[Database] Successfully connected to MongoDB Atlas cluster.');
    return true;
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', (error as Error).message);
    console.log('[Database] Falling back to local persistent document storage to prevent app downtime.');
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected,
    isAtlas: isConnected,
    readyState: mongoose.connection.readyState,
  };
};
