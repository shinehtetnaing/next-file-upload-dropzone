import ThemeToggle from "@/components/ThemeToggle";
import Uploader from "@/components/Uploader";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center">
      <ThemeToggle />
      <h1 className="mb-10 text-4xl font-bold">Upload your Files on S3 📂</h1>
      <Uploader />
    </main>
  );
}
