import type { Metadata } from 'next';

import Delivery from './_components/delivery';
import Featured from './_components/featured';
import FinalCta from './_components/final-cta';
import Hero from './_components/hero';
import Signature from './_components/signature';
import Story from './_components/story';

export const metadata: Metadata = {
    description:
        'Thoughtfully crafted chocolate, made in small batches and delivered fresh to your door.',
};

export default function HomePage() {
    return (
        <>
            <Hero />
            <Featured />
            <Story />
            <Signature />
            <Delivery />
            <FinalCta />
        </>
    );
}
