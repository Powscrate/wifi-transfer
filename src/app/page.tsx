import { getLocalIp } from '@/lib/ip';
import TransferHub from '@/components/transfer-hub';

export default function Home() {
  const localIp = getLocalIp();
  //Just adding a comment here
  // The dev script in package.json uses port 9002
  const port = process.env.PORT || '9002';
  const serverUrl = `http://${localIp}:${port}`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <TransferHub serverUrl={serverUrl} />
    </main>
    //Hi from Kaody
  );
}
