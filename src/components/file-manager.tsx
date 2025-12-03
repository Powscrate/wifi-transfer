'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, FileText, Download, Trash2, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileInfo = {
  name: string;
  size: number;
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function FileManager() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string, progress: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    pollIntervalRef.current = setInterval(fetchFiles, 5000); // Poll every 5 seconds
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadingFiles(prev =>
            prev.map(f => f.name === file.name ? { ...f, progress } : f)
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({ title: 'Upload successful', description: `File '${file.name}' has been uploaded.` });
          fetchFiles();
        } else {
          toast({ variant: 'destructive', title: 'Upload failed', description: `Could not upload '${file.name}'.` });
        }
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      };
      
      xhr.onerror = () => {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'An error occurred during upload.' });
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      };

      xhr.open('POST', '/api/upload', true);
      setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }]);
      xhr.send(formData);
    });
  }, [fetchFiles, toast]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true, noKeyboard: true });
  
  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`/api/files/${filename}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: 'File deleted', description: `'${filename}' was successfully deleted.` });
      fetchFiles();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Could not delete '${filename}'.` });
    }
  };

  return (
    <div className="space-y-6">
      <div {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <UploadCloud className={cn("w-12 h-12 text-muted-foreground", isDragActive && "text-primary animate-bounce")} />
          <p className="text-muted-foreground">
            {isDragActive ? "Drop files here to upload" : "Drag & drop files here"}
          </p>
          <Button onClick={open} variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Or Select Files
          </Button>
        </div>
      </div>
      
      {(uploadingFiles.length > 0) && (
        <div className="space-y-2">
          {uploadingFiles.map(file => (
            <div key={file.name} className="p-2 rounded-md bg-muted/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{file.progress}%</span>
              </div>
              <Progress value={file.progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle>Shared Files</CardTitle>
          <CardDescription>Files available for download on all connected devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : files.length > 0 ? (
              <ul className="space-y-2">
                {files.map(file => (
                  <li key={file.name} className="flex items-center justify-between p-3 rounded-md bg-background/70 hover:bg-accent/10 transition-colors duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <a href={`/api/files/${file.name}`} download aria-label={`Download ${file.name}`}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => handleDelete(file.name)} aria-label={`Delete ${file.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
                <FileText className="h-10 w-10 mb-4" />
                <p className="font-medium">No files shared yet</p>
                <p className="text-sm">Upload a file to get started.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
