import { Globe, Leaf, Sparkles, Store } from 'lucide-react';

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { BrandMark } from './brand-mark';

const steps = [
    { n: '01', label: 'Selecting', copy: 'We handpick beans for their flavour profile.' },
    { n: '02', label: 'Roasting', copy: 'Roasted in small batches to unlock depth.' },
    { n: '03', label: 'Refining', copy: 'Ground and conched to an exquisite texture.' },
    { n: '04', label: 'Tempering', copy: 'Tempered for a perfect snap and shine.' },
    { n: '05', label: 'Moulding', copy: 'Moulded and finished entirely by hand.' },
];

const milestones = [
    { year: '2019', icon: Leaf, copy: 'Chococart is born in a single Mumbai kitchen.' },
    { year: '2021', icon: Sparkles, copy: 'Our first single-origin bar leaves the marble.' },
    { year: '2023', icon: Store, copy: 'Neighbourhood ateliers open across four cities.' },
    { year: '2026', icon: Globe, copy: 'Ten-minute delivery, without losing the craft.' },
];

export default function Craft() {
    return (
        <section id="craft" className="scroll-mt-28 bg-ivory-dim">
            <div className="shell py-20 lg:py-24">
                <Reveal>
                    <span className="eyebrow text-cocoa-500">The Craft</span>
                    <h2 className="display-2 mt-4 text-cocoa-800">The Art of Chocolate</h2>
                    <p className="prose-body mt-5 text-cocoa-600">
                        Every bar is a celebration of craftsmanship and patience. Five steps, none
                        of which can be rushed.
                    </p>
                </Reveal>

                <RevealGroup
                    as="ol"
                    className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
                    {steps.map((step) => (
                        <RevealItem as="li" key={step.n}>
                            <div className="rule-gold w-10" />
                            <p className="tnum mt-4 font-heading text-2xl text-gold">{step.n}</p>
                            <h3 className="eyebrow mt-2 font-sans text-cocoa-800">{step.label}</h3>
                            <p className="mt-2 text-[0.8rem] leading-relaxed text-cocoa-500">
                                {step.copy}
                            </p>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>

            <div className="border-t border-border">
                <div className="shell grid gap-12 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-24">
                    <Reveal>
                        <BrandMark className="h-9 text-gold" />
                        <h2 className="display-3 mt-6 text-cocoa-800">A Heritage of Excellence</h2>
                        <p className="prose-body mt-5 text-cocoa-600">
                            Our story is one of passion, dedication and a timeless pursuit of
                            chocolate perfection.
                        </p>
                    </Reveal>

                    <RevealGroup
                        as="ol"
                        className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                        {milestones.map((milestone) => (
                            <RevealItem as="li" key={milestone.year} className="text-center">
                                <milestone.icon
                                    className="mx-auto size-5 text-cocoa-700"
                                    strokeWidth={1.3}
                                    aria-hidden="true"
                                />
                                <p className="tnum eyebrow mt-4 text-cocoa-800">
                                    {milestone.year}
                                </p>
                                {/* The dot sits on a hairline that runs the row's width. */}
                                <div className="relative mt-3 h-px bg-cocoa-200">
                                    <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
                                </div>
                                <p className="mt-4 text-[0.775rem] leading-relaxed text-cocoa-500">
                                    {milestone.copy}
                                </p>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </div>
        </section>
    );
}
