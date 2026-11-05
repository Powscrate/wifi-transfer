import { getLocalIp } from '@/lib/ip';
import TransferHub from '@/components/transfer-hub';

export default function Home() {
  const localIp = getLocalIp();
  // The dev script in package.json uses port 9002
  const port = process.env.PORT || '9002';
  const serverUrl = `http://${localIp}:${port}`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-violet-500/25 blur-[130px] animate-float-slow dark:bg-violet-600/20" />
        <div className="absolute -right-40 top-[-6rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[130px] animate-float dark:bg-cyan-500/15" />
        <div className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-fuchsia-400/20 blur-[140px] animate-float-slower dark:bg-fuchsia-600/15" />
        <div className="bg-grid absolute inset-0 opacity-70 dark:opacity-40" />
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <TransferHub serverUrl={serverUrl} />
      </main>
    </div>
  );
}
