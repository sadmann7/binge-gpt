import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// external imports
import { CheckCircle, Github, Tv2 } from "lucide-react";

const navLinks = [
  {
    name: "Github",
    icon: <Github className="aspect-square w-6" />,
    href: "https://github.com/sadmann7/watchcopilot.git",
    isExternal: true,
  },
  {
    name: "Top ",
    icon: <CheckCircle className="aspect-square w-6" />,
    href: "/top-shows",
    isExternal: false,
  },
];

const Header = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      aria-label="header"
      className={`fixed top-0 left-0 z-20 flex w-full items-center gap-4 ${
        isScrolled
          ? "bg-gray-200/50 shadow-md backdrop-blur-md backdrop-filter transition-all duration-300 ease-in-out"
          : "bg-transparent"
      }`}
      onScroll={handleScroll}
    >
      <nav className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          aria-label="navigate to home page"
          href="/"
          className="flex items-center gap-2 text-gray-900 transition-colors hover:text-black active:text-gray-900"
        >
          <Tv2 className="aspect-square w-5" />
          <span className="text-xl font-medium">WatchCopilot</span>
        </Link>
        <div className="flex items-center gap-2">
          {navLinks.map((link, index) =>
            link.isExternal ? (
              <a
                aria-label={`navigate to ${link.name} page`}
                key={index}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-transparent p-1.5 font-mono text-base text-gray-900 transition-colors hover:bg-gray-200 active:bg-gray-100"
              >
                {link.icon}
              </a>
            ) : (
              <Link
                aria-label={`navigate to ${link.name} page`}
                key={index}
                href={link.href}
                className={`rounded-md p-1.5 font-mono text-base text-gray-900 transition-colors hover:bg-gray-200 active:bg-gray-100 ${
                  router.pathname === link.href
                    ? "bg-gray-200"
                    : "bg-transparent"
                }`}
              >
                {link.icon}
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;