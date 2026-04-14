export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <h1 className="font-bold">My App</h1>
          <nav className="space-x-4">
            <a href="/">홈</a>
            <a href="/list">게시글 목록</a>
            <a href="/map">지도</a>
            <a href="/digitalTwin">디지털트윈</a>
            <a href="/index">todolist</a>
            <a href="/FCM">FCM</a>
            <a href="/chat">웹소켓 채팅</a>
            <a href="/QnA">QnA</a>
            <a href="/SeoulTod"> 서울 TOD</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {children}
      </main>

      <footer className="bg-gray-200 p-4 text-center"
        style={{color: "#000"}}>
        © 2026 My App
      </footer>
    </div>
  );
}
