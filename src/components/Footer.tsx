const Footer = () => {
  return (
    <footer aria-label="footer">
      <div className="grid place-items-center py-4">
        <h1 className="text-base text-black">
          Powred by{" "}
          <a
            aria-label="navigate to github repo"
            href="https://github.com/sadmann7"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-gray-700 transition-colors hover:text-black active:text-gray-700"
          >
            OpenAI
          </a>
          {", "}
          <a
            aria-label="navigate to tmdb"
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-gray-700 transition-colors hover:text-black active:text-gray-700"
          >
            TMDB
          </a>
          {", and "}
          <a
            aria-label="navigate to vercel"
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-gray-700 transition-colors hover:text-black active:text-gray-700"
          >
            Vercel
          </a>
        </h1>
      </div>
    </footer>
  );
};

export default Footer;