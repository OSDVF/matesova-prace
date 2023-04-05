import { createRef } from "preact";
import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";

type ValueType =
    | string
    | string[]
    | number
    | undefined
    | JSXInternal.SignalLike<string | string[] | number | undefined>;

export default function InputAutoSize ({ value, onChange }: { value: ValueType, onChange: (e: JSXInternal.TargetedEvent<HTMLInputElement>) => void }) {
    const [width, setWidth] = useState(0);
    const span = createRef<HTMLSpanElement>();

    useEffect(() => {
        setWidth(span.current?.offsetWidth ?? 100);
    }, [value, span, setWidth]);

    return (
        <>
            <span className="hide" ref={span}>{value}</span>
            <input value={value} type="text" style={{ width }} onChange={onChange} />
        </>
    );
};