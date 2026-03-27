import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// NOT FOUND PAGE
export const NotFoundPage = () => (
  <div className="container-app flex flex-col items-center justify-center min-h-[70vh] text-center py-16">
    <p
      style={{ fontFamily: "Syne, sans-serif" }}
      className="text-[9rem] font-extrabold text-stone-100 leading-none select-none"
    >
      404
    </p>
    <h1
      style={{ fontFamily: "Syne, sans-serif" }}
      className="text-3xl font-bold text-stone-900 -mt-6 mb-3"
    >
      Page not found
    </h1>
    <p className="text-stone-500 mb-8 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/">
      <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
        Back to Home
      </Button>
    </Link>
  </div>
);
