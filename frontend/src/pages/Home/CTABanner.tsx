import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

//  CTA Banner
export const CTABanner = () => (
  <section className="py-8">
    <div className="container-app">
      <div className="relative overflow-hidden rounded-3xl bg-brand-500 text-white px-8 py-12 lg:px-16 lg:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-5%] w-100 h-100 rounded-full bg-white/10" />
          <div className="absolute bottom-[-20%] left-[10%] w-75 h-75 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 max-w-xl">
          <p className="text-brand-100 text-sm font-medium mb-2">
            Limited time offer
          </p>
          <h2
            style={{ fontFamily: "Syne, sans-serif" }}
            className="text-3xl lg:text-4xl font-extrabold mb-4"
          >
            Get 15% off your first order
          </h2>
          <p className="text-brand-100 mb-8 leading-relaxed">
            Sign up today and use code{" "}
            <strong className="text-white">WELCOME15</strong> at checkout. Terms
            apply.
          </p>
          <Link to="/auth/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-brand-600 hover:bg-brand-50"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);
