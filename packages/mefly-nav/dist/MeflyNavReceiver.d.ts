import React from 'react';
interface Props {
    trustedOrigins?: string[];
    allowLocalhost?: boolean;
    style?: React.CSSProperties;
    activationMode?: 'click' | 'hover';
}
export declare function MeflyNavReceiver({ trustedOrigins, allowLocalhost, style, activationMode, }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
