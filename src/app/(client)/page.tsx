import type { Metadata } from 'next';

import Craft from './_components/craft';
import CollectionTeaser from './_components/collection-teaser';
import Hero from './_components/hero';
import Journal from './_components/journal';
import NewsLetter from './_components/newsleter';
import Story from './_components/story';
import Testimonial from './_components/testimonial';
import TrustBar from './_components/trust-bar';

export const metadata: Metadata = {
    title: 'Chococart — The Art of Pure Indulgence',
    description:
        "Bean to bar chocolate, tempered in small batches with the world's finest cacao and delivered to your door in ten minutes.",
};

export default function HomePage() {
    return (
        <>
            <Hero />
            <TrustBar />
            <CollectionTeaser />
            <Story />
            <Craft />
            <Testimonial />
            <Journal />
            <NewsLetter />
        </>
    );
}
