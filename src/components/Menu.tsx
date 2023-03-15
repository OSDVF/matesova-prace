// we want to render this component elsewhere in the DOM

import { JSXInternal } from "preact/src/jsx";
import '../styles/menu.scss'

type Props = {
    left: number,
    top: number,
    items: {
        text: string,
        onClick: JSXInternal.EventHandler<JSXInternal.TargetedMouseEvent<HTMLLIElement>>
    }[]
}
export function Menu({ left, top, items }: Props) {
    return (
        <ul class="menu" style={{ left, top }}>
            {items.map(item => (
                <li onClick={item.onClick}>{item.text}</li>
            ))}
        </ul>
    );
}
