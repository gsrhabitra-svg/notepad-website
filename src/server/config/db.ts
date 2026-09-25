import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[Database] MONGODB_URI is not set.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    /*
    |--------------------------------------------------------------------------
    | Reuse existing connection
    |--------------------------------------------------------------------------
    */

    if (mongoose.connection.readyState === 1) {
      isConnected = true;

      console.log('[Database] MongoDB Atlas connection already exists.');

      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Connect to MongoDB Atlas
    |--------------------------------------------------------------------------
    */

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;

    console.log(
      '[Database] Successfully connected to MongoDB Atlas cluster.'
    );

    return true;
  } catch (error) {
    isConnected = false;

    console.error(
      '[Database] MongoDB Atlas connection failed:',
      error instanceof Error ? error.message : error
    );

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
