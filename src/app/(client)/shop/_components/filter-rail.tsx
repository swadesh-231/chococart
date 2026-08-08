'use client';

import React from 'react';
import { Check } from 'lucide-react';

import { categoryLabel, FLAVOUR_NOTES, noteLabel, PRODUCT_CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import {
    activeFilterCount,
    COCOA_BANDS,
    type CocoaBand,
    DEFAULT_FILTERS,
    type ShopFilters,
} from './filters';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-border py-7 first:border-t-0 first:pt-0">
            <h3 className="eyebrow mb-4 text-[0.5625rem] text-cocoa-500">{title}</h3>
            {children}
        </div>
    );
}

/** A squared-off checkbox matching the house's flat, bordered controls. */
function Tick({
    checked,
    onChange,
    children,
}: {
    checked: boolean;
    onChange: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onChange}
            className="group flex w-full items-center gap-2.5 py-1.5 text-left">
            <span
                className={cn(
                    'flex size-4 shrink-0 items-center justify-center border transition-colors',
                    checked
                        ? 'border-cocoa-800 bg-cocoa-800 text-ivory'
                        : 'border-cocoa-300 group-hover:border-cocoa-500'
                )}>
                {checked && <Check className="size-3" strokeWidth={2.5} />}
            </span>
            <span
                className={cn(
                    'text-[0.825rem] transition-colors',
                    checked ? 'text-cocoa-900' : 'text-cocoa-600 group-hover:text-cocoa-900'
                )}>
                {children}
            </span>
        </button>
    );
}

export default function FilterRail({
    filters,
    onChange,
    total,
}: {
    filters: ShopFilters;
    onChange: (next: ShopFilters) => void;
    total: number | null;
}) {
    const set = <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) =>
        onChange({ ...filters, [key]: value });

    const toggleNote = (note: string) =>
        set(
            'notes',
            filters.notes.includes(note)
                ? filters.notes.filter((n) => n !== note)
                : [...filters.notes, note]
        );

    const count = activeFilterCount(filters);

    return (
        <div>
            <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-2xl text-cocoa-800">Refine</h2>
                {count > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            // The search box lives outside the rail, so clearing
                            // the filters must not silently wipe the query too.
                            onChange({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort })
                        }
                        className="eyebrow link-underline text-[0.5625rem] text-cocoa-500 hover:text-cocoa-800">
                        Clear all
                    </button>
                )}
            </div>

            <div className="rule-gold mt-4 mb-7 w-16" />

            <Group title="Type">
                <ul className="space-y-0.5">
                    {['all', ...PRODUCT_CATEGORIES].map((name) => {
                        const selected = filters.category === name;
                        return (
                            <li key={name}>
                                <button
                                    type="button"
                                    onClick={() => set('category', name)}
                                    aria-pressed={selected}
                                    className={cn(
                                        'w-full py-1.5 text-left text-[0.825rem] transition-colors',
                                        selected
                                            ? 'text-cocoa-900'
                                            : 'text-cocoa-600 hover:text-cocoa-900'
                                    )}>
                                    <span
                                        className={cn(
                                            'inline-block border-b pb-0.5 transition-colors',
                                            selected ? 'border-gold' : 'border-transparent'
                                        )}>
                                        {name === 'all' ? 'Everything' : categoryLabel(name)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Group>

            <Group title="Cocoa">
                <ul className="space-y-0.5">
                    {(Object.keys(COCOA_BANDS) as CocoaBand[]).map((key) => {
                        const selected = filters.cocoa === key;
                        return (
                            <li key={key}>
                                <button
                                    type="button"
                                    onClick={() => set('cocoa', key)}
                                    aria-pressed={selected}
                                    className={cn(
                                        'tnum w-full py-1.5 text-left text-[0.825rem] transition-colors',
                                        selected
                                            ? 'text-cocoa-900'
                                            : 'text-cocoa-600 hover:text-cocoa-900'
                                    )}>
                                    <span
                                        className={cn(
                                            'inline-block border-b pb-0.5 transition-colors',
                                            selected ? 'border-gold' : 'border-transparent'
                                        )}>
                                        {COCOA_BANDS[key].label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Group>

            <Group title="Tasting notes">
                <ul>
                    {FLAVOUR_NOTES.map((note) => (
                        <li key={note}>
                            <Tick
                                checked={filters.notes.includes(note)}
                                onChange={() => toggleNote(note)}>
                                {noteLabel(note)}
                            </Tick>
                        </li>
                    ))}
                </ul>
                {filters.notes.length > 1 && (
                    <p className="mt-3 text-[0.7rem] leading-relaxed text-cocoa-400">
                        Showing chocolates with any of these notes.
                    </p>
                )}
            </Group>

            <Group title="Dietary">
                <Tick checked={filters.vegan} onChange={() => set('vegan', !filters.vegan)}>
                    Vegan
                </Tick>
                <Tick
                    checked={filters.glutenFree}
                    onChange={() => set('glutenFree', !filters.glutenFree)}>
                    Gluten free
                </Tick>
            </Group>

            {total !== null && (
                <p className="tnum border-t border-border pt-6 text-[0.75rem] text-cocoa-500">
                    {total} {total === 1 ? 'chocolate' : 'chocolates'} match
                </p>
            )}
        </div>
    );
}
