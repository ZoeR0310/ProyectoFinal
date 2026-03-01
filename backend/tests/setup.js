import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

let mongoServer;

beforeAll(async () => {
  try {
    console.log('Iniciando MongoDB Memory Server...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    await mongoose.connect(uri);
    console.log('MongoDB Memory Server conectado');
  } catch (error) {
    console.error('Error en setup de MongoDB Memory Server:', error);
    throw error;
  }
});

afterAll(async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('MongoDB Memory Server detenido');
  }
});
