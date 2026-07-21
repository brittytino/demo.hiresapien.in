/**
 * GET /api/health
 * System health check — MongoDB ping
 */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  let mongoStatus = 'ok';
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
      await mongoose.connection.db?.command({ ping: 1 });
    } else {
      mongoStatus = 'skipped (no MONGO_URI)';
    }
  } catch (err: any) {
    mongoStatus = `error: ${err.message}`;
  }

  return NextResponse.json({
    status:          'ok',
    version:         '5.0.0',
    mongo:           mongoStatus,
  });
}
