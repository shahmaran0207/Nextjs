import Script from "next/script";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />
      {children}
    </>
  );
}
