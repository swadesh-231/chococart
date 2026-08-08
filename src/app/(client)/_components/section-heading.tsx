import React from 'react';
import { cn } from '@/lib/utils';

export default function SectionHeading({
    eyebrow,
    title,
    align = 'center',
    tone = 'light',
    className,
}: {
    eyebrow?: string;
    title: React.ReactNode;
    align?: 'center' | 'left';
    tone?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col',
                align === 'center' ? 'items-center text-center' : 'items-start text-left',
                className
            )}>
            {eyebrow && (
                <span className={cn('eyebrow', tone === 'dark' ? 'text-gold' : 'text-cocoa-500')}>
                    {eyebrow}
                </span>
            )}
            <h2
                className={cn(
                    'mt-4 font-heading text-4xl leading-tight font-medium sm:text-5xl',
                    tone === 'dark' ? 'text-ivory' : 'text-cocoa-800'
                )}>
                {title}
            </h2>
        </div>
    );
}
