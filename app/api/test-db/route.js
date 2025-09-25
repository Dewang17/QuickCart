import connectDB from '@/config/db';

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: 'Connected to MongoDB' });
  } catch (error) {
    return Response.json({ status: 'Failed to connect', error: error.message }, { status: 500 });
  }
} 