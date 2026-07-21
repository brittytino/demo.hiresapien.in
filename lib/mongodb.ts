import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

async function connectDB(): Promise<typeof mongoose> {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error(
      'MONGO_URI environment variable is not defined. ' +
      'Please copy .env.local.example to .env.local and fill in your MongoDB Atlas URI.'
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 3000,
      })
      .catch((err: unknown) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Wraps connectDB with a hard wall-clock timeout (default 3 s).
 * The OS-level DNS SRV lookup ignores Mongoose's serverSelectionTimeoutMS,
 * so without this wrapper a bad/unreachable cluster hangs for ~90 s.
 */
export async function connectWithTimeout(ms = 3000): Promise<typeof mongoose> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`DB connection timed out after ${ms}ms`)), ms)
  );
  return Promise.race([connectDB(), timeout]);
}

export default connectDB;
