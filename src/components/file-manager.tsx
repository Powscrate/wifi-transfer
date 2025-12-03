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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
          toast({ title: 'Téléchargement réussi', description: `Fichier '${file.name}' a été téléversé.` });
          fetchFiles();
        } else {
          toast({ variant: 'destructive', title: 'Échec du téléversement', description: `Impossible de téléverser '${file.name}'.` });
        }
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      };
      
      xhr.onerror = () => {
        toast({ variant: 'destructive', title: 'Échec du téléversement', description: 'Une erreur est survenue lors du téléversement.' });
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
      toast({ title: 'Fichier supprimé', description: `'${filename}' a été supprimé avec succès.` });
      fetchFiles();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: `Impossible de supprimer '${filename}'.` });
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 flex-shrink-0",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <UploadCloud className={cn("w-10 h-10 text-muted-foreground", isDragActive && "text-primary animate-bounce")} />
          <p className="text-muted-foreground text-sm">
            {isDragActive ? "Lâchez les fichiers ici" : "Glissez-déposez des fichiers"}
          </p>
          <Button onClick={open} variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Ou sélectionnez
          </Button>
        </div>
      </div>
      
      {(uploadingFiles.length > 0) && (
        <div className="space-y-2 flex-shrink-0">
          {uploadingFiles.map(file => (
            <div key={file.name} className="p-2 rounded-md bg-secondary">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium truncate">{file.name}</span>
                <span className="text-xs text-secondary-foreground">{file.progress}%</span>
              </div>
              <Progress value={file.progress} className="h-2" />
            </div>
))}
        </div>
      )}

      <Card className="bg-transparent border-none shadow-none flex-grow flex flex-col">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Fichiers Partagés</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <ScrollArea className="h-64 pr-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : files.length > 0 ? (
              <ul className="space-y-2">
                {files.map(file => (
                  <li key={file.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary hover:bg-accent transition-colors duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-xs text-secondary-foreground">{formatBytes(file.size)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <a href={`/api/files/${file.name}`} download aria-label={`Download ${file.name}`}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" aria-label={`Delete ${file.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le fichier '{file.name}' sera définitivement supprimé.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(file.name)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-secondary-foreground py-10 rounded-lg bg-secondary">
                <FileText className="h-10 w-10 mb-4" />
                <p className="font-medium">Aucun fichier partagé</p>
                <p className="text-sm">Téléversez un fichier pour commencer.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
