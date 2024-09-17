import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// const connectionString = process.env.DATABASE_URL!
const localConnectionString = 'postgres://postgres:mysecretpassword@localhost:5432/postgres'!

const local_client = postgres(localConnectionString)
const online_client = postgres('postgresql://postgres.hllorgtyecngjahopaft:a2judyhgAcdfWHk7@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres')

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.ANON_KEY!)

export const localDB = drizzle(local_client);
export const onlineDB = drizzle(online_client);