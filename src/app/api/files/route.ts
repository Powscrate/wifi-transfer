import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadsDirExists() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureUploadsDirExists();
    const filenames = await fs.readdir(UPLOADS_DIR);
    const filesWithStats = await Promise.all(
      filenames.map(async (name) => {
        const stats = await fs.stat(path.join(UPLOADS_DIR, name));
        return { name, size: stats.size };
      })
    );
    return NextResponse.json({ files: filesWithStats });
  } catch (error) {
    console.error('Failed to list files:', error);
    return NextResponse.json({ error: 'Could not list files.' }, { status: 500 });
  }
}
