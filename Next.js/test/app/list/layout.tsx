import Providers from "../providers";

export const metadata = {
  title: "Test Page",
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      {/* 🔹 /test 전용 헤더 */}
      <header className="bg-blue-700 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <h1 className="font-bold">Test Zone</h1>
          <nav className="space-x-4">
            <a href="/">홈으로</a>
            <a href="/write">게시글 작성</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Providers>
          {children}
        </Providers>
      </main>
    </div>
  );
}