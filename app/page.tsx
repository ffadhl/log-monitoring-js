import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1 className="text-4xl font-bold">Log Monitoring System</h1>
      <p className="text-gray-500">Project by Del</p>
      
      {/* Ini tombol dari Shadcn UI */}
      <Button>Klik Saya</Button> 
      <Button variant="destructive">Tombol Bahaya</Button>
      <Button variant="outline">Tombol Outline</Button>
    </main>
  );
}