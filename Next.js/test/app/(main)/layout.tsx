export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a" }}>
      {children}
    </div>
  );
}
