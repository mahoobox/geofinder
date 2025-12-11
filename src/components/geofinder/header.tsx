import { MapPin } from "lucide-react";
import EnvChecker from "./env-checker";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <MapPin className="text-primary h-8 w-8" />
        <h1 className="text-2xl font-bold text-foreground font-headline">
          GeoFinder
        </h1>
      </div>
      <EnvChecker />
    </header>
  );
};

export default Header;
