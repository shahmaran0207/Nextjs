import Script from "next/script";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />
      <div style={{ minHeight: "100vh", background: "#0a0e1a" }}>
        {children}
      </div>
    </>
  );
}
