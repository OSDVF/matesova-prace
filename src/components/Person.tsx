import classNames from "classnames";
import { useDrag } from "react-dnd";
import InputAutoSize from "./InputAutoSize";

export type Person = {
    name: string,
    friends: Person[]
};
type Props = {
    person: Person,
    onRemove: (p: Person) => void
    teamIndex: number
    onDrop: (p: Person, sourceTeam: number) => void,
    onChangeName: (p: Person, newName: string) => void
}

export type PersonDragPayload = {
    person: Person,
    sourceTeamIndex: number
}

export default function PersonElem({ person, onRemove, teamIndex, onDrop, onChangeName }: Props) {
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
            src={import.meta.env.BASE_URL + 'person.svg'}
            alt="Osoba"
        />
        <InputAutoSize value={person.name} onChange={e => onChangeName(person, e.currentTarget.value)}></InputAutoSize>&ensp;
        <button onClick={() => onRemove(person)}>🗑</button>
        <br />
    </div >
}