import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import i18n from "@/lib/i18n";
import GuestLayout from "@/components/layout/guest-layout";

export default function NotFound() {
  return (
    <GuestLayout showLiveStreamBanner={false}>
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center py-16 telegram-fade-in">
        <div className="text-center mb-8">
          <AlertCircle className="h-24 w-24 text-secondary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">{i18n.t('pageNotFound')}</h1>
          <p className="text-gray-400 mb-6">
            {i18n.t('pageNotFoundDescription')}
          </p>
          
          <Link to="/">
            <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-3 rounded-md flex items-center transition-all duration-300 transform hover:scale-105 mx-auto">
              <Home className="h-5 w-5 ml-2" />
              {i18n.t('backToHome')}
            </Button>
          </Link>
        </div>
        
        <div className="w-full max-w-lg border border-gray-800 rounded-lg p-6 mt-8 bg-surface/50">
          <h3 className="text-xl font-medium mb-4">{i18n.t('suggestedLinks')}</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/">
                <span className="text-secondary hover:text-secondary/80 transition-colors">
                  {i18n.t('home')}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/movies">
                <span className="text-secondary hover:text-secondary/80 transition-colors">
                  {i18n.t('movies')}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/series">
                <span className="text-secondary hover:text-secondary/80 transition-colors">
                  {i18n.t('series')}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/voting">
                <span className="text-secondary hover:text-secondary/80 transition-colors">
                  {i18n.t('voting')}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </GuestLayout>
  );
}
