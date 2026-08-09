import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';

const steps = [
    { n: '01', label: 'Choose', copy: 'Select your chocolates.' },
    { n: '02', label: 'We prepare', copy: 'Packed carefully.' },
    { n: '03', label: 'Delivered', copy: 'Fresh to your door.' },
];

export default function Delivery() {
    return (
        <section id="delivery" className="scroll-mt-24 bg-ivory">
            <div className="shell py-24 lg:py-32">
                <Reveal>
                    <h2 className="display-2 max-w-lg text-cocoa-950">
                        From our kitchen
                        <br />
                        to your doorstep.
                    </h2>
                </Reveal>

                {/* Typography, not cards — a hairline over each step is the only
                    chrome the section gets. */}
                <RevealGroup as="ol" className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10 lg:mt-24">
                    {steps.map((step) => (
                        <RevealItem as="li" key={step.n} className="border-t border-border pt-7">
                            <p className="tnum eyebrow text-caramel">{step.n}</p>
                            <h3 className="mt-5 font-heading text-2xl font-medium text-cocoa-950">
                                {step.label}
                            </h3>
                            <p className="mt-3 text-[0.875rem] leading-relaxed text-cocoa-500">
                                {step.copy}
                            </p>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
