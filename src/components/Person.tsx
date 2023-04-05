import classNames from "classnames";
import { useDrag } from "react-dnd";

export type Person = {
    name: string,
    friends: Person[]
};
type Props = {
    person: Person,
    onRemove: () => void
}

export default function PersonElem({ person, onRemove }: Props) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'person',
        item: person,
        collect: (monitor: any) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return <div class={classNames({
        person: true,
        dragging: isDragging
    })}
        ref={drag}
    >
        <img
            src="/person.svg"
            alt="Osoba"
        />
        <span>{person.name}</span>&ensp;
        <button onClick={onRemove}>🗑</button>
        <br />
    </div >
}