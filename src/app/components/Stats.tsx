export const Stats = () => {
    const stats = [
        { label: "Active Students", value: "2K+" },
        { label: "Curriculum Accuracy", value: "95%" },
        { label: "AI Availability", value: "24/7" },
    ];

    return (
        <section className="pt-12 pb-12 bg-white">
            <div className="max-w-[1440px] mx-auto px-4 md:px-10">
                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-32">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-3xl md:text-4xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                                {stat.value}
                            </div>
                            <div className="text-muted-foreground font-medium text-xs md:text-sm uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
