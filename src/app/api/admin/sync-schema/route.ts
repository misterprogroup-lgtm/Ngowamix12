import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { execSync } from 'child_process';

export async function POST() {
  try {
    await requireRole(['ADMIN']);

    const output = execSync('npx prisma db push --skip-generate', {
      encoding: 'utf-8',
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: 'Base de données synchronisée',
      output: output.split('\n').slice(-5).join('\n'),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
