import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { Learners } from "./components/Learners";
import { HowItWorks } from "./components/HowItWorks";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background selection:bg-indigo-100 selection:text-primary">
            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <Learners />
            <HowItWorks />
            <Testimonials />
            <CTA />
            <Footer />
        </main>
    );
}
