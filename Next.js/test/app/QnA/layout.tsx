import Providers from "../providers";

export const metadata = {
  title: "QnA",
};

export default function QnALayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
