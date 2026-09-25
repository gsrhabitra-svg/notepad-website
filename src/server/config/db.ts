import mongoose from 'mongoose';

let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    cachedConnection = mongoose;

    console.log('[Database] Connected to MongoDB Atlas');

    return mongoose;
  } catch (error) {
    console.error(
      '[Database] MongoDB connection failed:',
      error instanceof Error ? error.message : error
    );

    throw error;
  }
};

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    isAtlas: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
  };
};
