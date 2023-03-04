import { FiExternalLink } from "react-icons/fi";
import {
  SiAppletv,
  SiCrunchyroll,
  SiHbo,
  SiHulu,
  SiNetflix,
  SiPrimevideo,
  SiRoku,
  SiYoutubetv,
} from "react-icons/si";

const OttIcon = ({ url }: { url: string }) => {
  switch (
    url.match(/https:\/\/www\.(.+)\.com\/.+/)?.[1] ??
    url.match(/https:\/\/(.+)\.com\/.+/)?.[1]
  ) {
    case "netflix":
      return <SiNetflix className="text-white" size={16} />;
    case "hulu":
      return <SiHulu className="text-white" size={16} />;
    case "hbo":
      return <SiHbo className="text-white" size={16} />;
    case "appletv":
      return <SiAppletv className="text-white" size={16} />;
    case "primevideo":
      return <SiPrimevideo className="text-white" size={16} />;
    case "youtubetv":
      return <SiYoutubetv className="text-white" size={16} />;
    case "roku":
      return <SiRoku className="text-white" size={16} />;
    case "crunchyroll":
      return <SiCrunchyroll className="text-white" size={16} />;
    default:
      return <FiExternalLink className="text-white" size={16} />;
  }
};

export default OttIcon;
