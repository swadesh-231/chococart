import React from 'react';

export default function PageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
                {eyebrow && <p className="eyebrow text-[0.6rem] text-cocoa-500">{eyebrow}</p>}
                <h1 className="mt-2 font-heading text-3xl font-medium text-cocoa-800">{title}</h1>
                {description && (
                    <p className="mt-2 text-[0.85rem] text-cocoa-500">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
