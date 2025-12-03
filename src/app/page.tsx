import { getLocalIp } from '@/lib/ip';
import TransferHub from '@/components/transfer-hub';

export default function Home() {
  const localIp = getLocalIp();
  // The dev script in package.json uses port 9002
  const port = process.env.PORT || '9002';
  const serverUrl = `http://${localIp}:${port}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="z-10 w-full max-w-5xl">
        <TransferHub serverUrl={serverUrl} />
      </div>
    </main>
  );
}
