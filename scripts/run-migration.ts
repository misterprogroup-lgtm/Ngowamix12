import { execSync } from 'child_process';

const result = execSync('npx prisma migrate deploy', {
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  stdio: 'inherit',
});
process.exit(0);
