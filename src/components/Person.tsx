import classNames from "classnames";
import dnd from "preact-dnd";

export type Person = {
    name: string,
    friends: Person[]
};
type Props = {
    person: Person,
    onRemove: () => void
}

export default function PersonElem({ person, onRemove }: Props) {
    const [{ isDragging }, drag] = dnd.useDrag(() => ({
        type: 'person',
        item: person,
        collect: monitor => ({
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