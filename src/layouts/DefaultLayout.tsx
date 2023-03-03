import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Meta from "@/components/layout/Meta";
import { type ReactNode } from "react";

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Meta />
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default DefaultLayout;
