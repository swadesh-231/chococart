import { Gift, Leaf, Sparkles, Timer } from 'lucide-react';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

const pillars = [
    {
        icon: Leaf,
        title: 'Single origin cacao',
        copy: 'Ethically sourced from the world’s finest regions.',
    },
    {
        icon: Timer,
        title: '10 minute delivery',
        copy: 'From our nearest atelier, straight to your door.',
    },
    {
        icon: Sparkles,
        title: 'Natural ingredients',
        copy: 'No artificial flavours, no preservatives.',
    },
    {
        icon: Gift,
        title: 'Beautifully packaged',
        copy: 'Thoughtful details, made to be remembered.',
    },
];

export default function TrustBar() {
    return (
        <section aria-label="Why Chococart" className="border-b border-border bg-ivory-dim">
            <RevealGroup
                as="ul"
                stagger={0.07}
                className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {pillars.map((pillar) => (
                    <RevealItem
                        as="li"
                        key={pillar.title}
                        // Dividers only appear once the columns sit side by side.
                        className="flex items-start gap-4 border-border py-7 sm:py-9 lg:border-l lg:pr-6 lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
                        <pillar.icon
                            className="mt-0.5 size-5 shrink-0 text-gold"
                            strokeWidth={1.3}
                            aria-hidden="true"
                        />
                        <div>
                            <h3 className="eyebrow font-sans text-cocoa-800">{pillar.title}</h3>
                            <p className="mt-2 text-[0.8rem] leading-relaxed text-cocoa-500">
                                {pillar.copy}
                            </p>
                        </div>
                    </RevealItem>
                ))}
            </RevealGroup>
        </section>
    );
}
