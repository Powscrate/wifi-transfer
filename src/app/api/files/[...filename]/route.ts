import { NextResponse } from 'next/server';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Helper to sanitize and resolve file path safely
function safeJoin(base: string, ...parts: string[]): string | null {
  const joinedPath = path.join(base, ...parts);
  if (path.resolve(joinedPath).startsWith(path.resolve(base))) {
    return joinedPath;
  }
  return null;
}

export async function GET(request: Request, { params }: { params: { filename: string[] } }) {
  try {
    const filename = params.filename.join('/');
    const filePath = safeJoin(UPLOADS_DIR, filename);

    if (!filePath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const stats = await fsp.stat(filePath);
    const fileStream = fs.createReadStream(filePath);
    
    return new NextResponse(fileStream as any, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size.toString(),
      },
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Error downloading file' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { filename: string[] } }) {
    try {
        const filename = params.filename.join('/');
        const filePath = safeJoin(UPLOADS_DIR, filename);

        if (!filePath) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }

        await fsp.unlink(filePath);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
    }
}
