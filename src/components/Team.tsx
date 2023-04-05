import { useDrop } from "react-dnd"
import PersonElem, { Person } from "./Person"
import classNames from "classnames"

export type Team = {
    name: string,
    people: Person[]
}

type Props = {
    team: Team,
    showDeleteButton: boolean,
    onNameChange: (n: string) => void,
    onChange: (t: Team) => void
}

export default function TeamElem({ team, onNameChange, onChange, showDeleteButton }: Props) {
    function removePerson(indexP: number): void {
        team.people.splice(indexP, 1);
        onChange(team);
    }

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'person',
        drop: (item: Person) => {
            team.people.push(item)
        },
        collect: (monitor: any) => ({
            isOver: !!monitor.isOver(),
        }),
    }))

    return <div ref={drop} class={classNames({ isOver: isOver })}>
        <h3><input type="text" value={team.name} onChange={e => onNameChange(e.currentTarget.value)} />
            {showDeleteButton && <button>🗑</button>}
        </h3>
        {team.people.map((person, indexP) =>
            <PersonElem onRemove={() => removePerson(indexP)}
                person={person}
            />
        )}
    </div >
}