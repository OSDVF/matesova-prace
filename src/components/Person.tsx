import classNames from "classnames";
import { useDrag } from "react-dnd";

export type Person = {
    name: string,
    friends: Person[]
};
type Props = {
    person: Person,
    onRemove: (p: Person) => void
    teamIndex: number
    onDrop: (p: Person, sourceTeam: number) => void
}

export type PersonDragPayload = {
    person: Person,
    sourceTeamIndex: number
}

export default function PersonElem({ person, onRemove, teamIndex, onDrop }: Props) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'person',
        item: {
            person,
            sourceTeamIndex: teamIndex
        },
        end(_, monitor) {
            if (monitor.didDrop()) {
                onDrop(person, teamIndex);
            }
        },
        collect: (monitor: any) => {
            return ({
                isDragging: !!monitor.isDragging(),
            });
        },
    }), [onRemove, onDrop, person, teamIndex])

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
        <button onClick={() => onRemove(person)}>🗑</button>
        <br />
    </div >
}