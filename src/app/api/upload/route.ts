import { NextResponse } from 'next/server';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

async function ensureUploadsDirExists() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    await ensureUploadsDirExists();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const filePath = path.join(UPLOADS_DIR, file.name);

    // Security check to prevent path traversal
    if (!path.resolve(filePath).startsWith(path.resolve(UPLOADS_DIR))) {
        return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
    }

    const fileStream = file.stream();
    const writeStream = Writable.toWeb(fs.createWriteStream(filePath));
    
    await pipeline(fileStream, writeStream);

    return NextResponse.json({ success: true, filename: file.name });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}
