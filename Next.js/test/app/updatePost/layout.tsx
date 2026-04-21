import Providers from "../providers";

export const metadata = {
  title: "게시글 수정",
};

export default function UpdatePostLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </Providers>
  );
}
