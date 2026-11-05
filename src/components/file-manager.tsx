'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  UploadCloud,
  Download,
  Trash2,
  Loader2,
  RefreshCw,
  Inbox,
  File as FileIcon,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FolderUp,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

type FileInfo = {
  name: string;
  size: number;
};

type FileMeta = {
  icon: typeof FileIcon;
  gradient: string;
};

const FILE_TYPES: { extensions: string[]; meta: FileMeta }[] = [
  {
    extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'heic', 'bmp'],
    meta: { icon: FileImage, gradient: 'from-rose-500 to-orange-400' },
  },
  {
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'],
    meta: { icon: FileVideo, gradient: 'from-violet-500 to-fuchsia-500' },
  },
  {
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'],
    meta: { icon: FileAudio, gradient: 'from-amber-500 to-orange-500' },
  },
  {
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    meta: { icon: FileArchive, gradient: 'from-emerald-500 to-teal-500' },
  },
  {
    extensions: ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'py', 'java', 'rs', 'go', 'sh', 'xml'],
    meta: { icon: FileCode, gradient: 'from-sky-500 to-cyan-500' },
  },
  {
    extensions: ['xls', 'xlsx', 'csv', 'ods'],
    meta: { icon: FileSpreadsheet, gradient: 'from-green-500 to-emerald-500' },
  },
  {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'ppt', 'pptx'],
    meta: { icon: FileText, gradient: 'from-blue-500 to-indigo-500' },
  },
];

const DEFAULT_META: FileMeta = {
  icon: FileIcon,
  gradient: 'from-slate-500 to-slate-700',
};

function getFileMeta(filename: string): FileMeta {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return FILE_TYPES.find(({ extensions }) => extensions.includes(extension))?.meta ?? DEFAULT_META;
}

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
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFiles();
    setIsRefreshing(false);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadingFiles((prev) =>
              prev.map((f) => (f.name === file.name ? { ...f, progress } : f))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            toast({
              title: 'Téléversement réussi',
              description: `Le fichier '${file.name}' a été partagé.`,
            });
            fetchFiles();
          } else {
            toast({
              variant: 'destructive',
              title: 'Échec du téléversement',
              description: `Impossible de téléverser '${file.name}'.`,
            });
          }
          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
        };

        xhr.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Échec du téléversement',
            description: 'Une erreur est survenue lors du téléversement.',
          });
          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
        };

        xhr.open('POST', '/api/upload', true);
        setUploadingFiles((prev) => [...prev, { name: file.name, progress: 0 }]);
        xhr.send(formData);
      });
    },
    [fetchFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop });

  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`/api/files/${filename}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      toast({
        title: 'Fichier supprimé',
        description: `'${filename}' a été supprimé avec succès.`,
      });
      fetchFiles();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de supprimer '${filename}'.`,
      });
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <section className="glass-panel relative overflow-hidden rounded-[28px] p-4 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <FolderUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headline text-lg font-semibold leading-tight tracking-tight">
              Fichiers partagés
            </h2>
            <p className="text-xs text-muted-foreground">
              {files.length > 0
                ? `${files.length} fichier${files.length > 1 ? 's' : ''} · ${formatBytes(totalSize)}`
                : 'Votre espace de transfert'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label="Actualiser la liste des fichiers"
          className="h-9 w-9 rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'group relative mt-5 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-all duration-300 sm:py-7',
          isDragActive
            ? 'scale-[1.01] border-primary bg-primary/[0.06] shadow-lg shadow-primary/10'
            : 'border-border/80 bg-background/40 hover:border-primary/40 hover:bg-primary/[0.03]'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_65%)]"
          />
        )}

        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-violet-500/25 transition-transform duration-300',
              isDragActive ? 'scale-110 -translate-y-1' : 'group-hover:-translate-y-1'
            )}
          >
            <UploadCloud className={cn('h-7 w-7', isDragActive && 'animate-pulse')} />
          </div>

          <p className="mt-3 font-headline text-sm font-semibold sm:text-base">
            {isDragActive ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            ou sélectionnez-les depuis votre appareil
          </p>

          <Button
            type="button"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
            className="mt-3.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-5 text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.03] hover:from-violet-500 hover:to-indigo-500 hover:text-white"
          >
            Parcourir les fichiers
          </Button>
        </div>
      </div>

      {/* Active uploads */}
      {uploadingFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploadingFiles.map((file) => (
            <div
              key={file.name}
              className="rounded-xl border border-border/60 bg-background/60 p-3 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {file.progress}%
                    </span>
                  </div>
                  <Progress value={file.progress} className="mt-2 h-1.5 bg-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      <div className="mt-4">
        <ScrollArea className="h-[286px] pr-3 sm:h-[320px] lg:h-[338px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs">Chargement des fichiers…</span>
              </div>
            </div>
          ) : files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((file) => {
                const { icon: Icon, gradient } = getFileMeta(file.name);
                return (
                  <li
                    key={file.name}
                    className="group flex items-center gap-3 rounded-2xl border border-transparent bg-secondary/40 p-2.5 transition-all duration-200 hover:border-border/80 hover:bg-secondary/70 sm:p-3"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                        gradient
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-background hover:text-primary"
                      >
                        <a
                          href={`/api/files/${file.name}`}
                          download
                          aria-label={`Télécharger ${file.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Supprimer ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le fichier &apos;{file.name}&apos; sera
                              définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(file.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/30 px-6 text-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-secondary/80">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-4 font-headline text-sm font-semibold">Aucun fichier pour le moment</p>
              <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                Glissez un fichier ci-dessus pour commencer le partage.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </section>
  );
}
