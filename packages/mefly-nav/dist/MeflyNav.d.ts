import React from 'react';
import type { MeflyNavItem } from './types';
interface Props {
    items: MeflyNavItem[];
    activeId?: string;
    style?: React.CSSProperties;
    activationMode?: 'click' | 'hover';
    onSelect?: (item: MeflyNavItem) => void;
}
export declare function MeflyNav({ items, activeId, style, activationMode, onSelect }: Props): import("react/jsx-runtime").JSX.Element;
export {};
