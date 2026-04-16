import Providers from "../providers";

export const metadata = {
  title: "게시글",
};

export default function ListLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
