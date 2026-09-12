import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PdfDocument } from '@/types';

export async function GET() {
  try {
    const materialsDir = path.join(process.cwd(), 'public', 'materials');
    
    if (!fs.existsSync(materialsDir)) {
      return NextResponse.json({ documents: [] });
    }

    const files = fs.readdirSync(materialsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    const documents: PdfDocument[] = pdfFiles.map((file, idx) => {
      const stats = fs.statSync(path.join(materialsDir, file));
      const title = file
        .replace(/\.pdf$/i, '')
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);

      return {
        id: `pdf-auto-${idx}-${file.replace(/[^a-zA-Z0-9]/g, '')}`,
        title,
        category: 'Study Library',
        description: `Materials PDF file (${sizeMB} MB)`,
        url: `/materials/${encodeURIComponent(file)}`,
        fileName: file,
        tags: ['Library', 'Study'],
        addedAt: stats.mtime.toISOString().split('T')[0],
        isExternal: false,
      };
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Failed to read materials directory:', error);
    return NextResponse.json({ documents: [] }, { status: 500 });
  }
}

