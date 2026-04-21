export const metadata = {
  title: "QnA 작성",
};

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
