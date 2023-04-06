import { useDrop } from "react-dnd"
import PersonElem, { Person, PersonDragPayload } from "./Person"
import classNames from "classnames"
import { useCallback, useState } from "preact/hooks"
import InputAutoSize from "./InputAutoSize"

export type Team = {
    id: number | null,
    name: string,
    people: Person[]
}

type Props = {
    team: Team,
    showDeleteButton: boolean,
    onNameChange: (n: string) => void,
    onChange: (t: Team) => void,
    onDelete: () => void,
    onDrop: (p: Person, sourceTeam: number) => void,
    teamIndex: number
}

export default function TeamElem({ team, onNameChange, onChange, showDeleteButton, teamIndex, onDelete, onDrop }: Props) {
    const [isDragging, setDragging] = useState(false);

    const removePerson = useCallback((pIndex: number) => {
        const newTeam = { ...team }
        newTeam.people.splice(pIndex, 1);
        onChange(newTeam);
    }, [team, onChange]);
    const addPerson = useCallback((item: Person) => {
        const newTeam = { ...team }
        newTeam.people.push(item)
        onChange(newTeam)
    }, [team, onChange])

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'person',
        drop: (item: PersonDragPayload, monitor) => {
            if (item.sourceTeamIndex != teamIndex) {
                addPerson(item.person);
                onDrop(item.person, item.sourceTeamIndex);
            }
        },
        collect: (monitor: any) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [addPerson, teamIndex])

    return <div ref={drop} class={classNames({ isOver: isOver, team: true, isNew: team.id == null })}>
        <h3><InputAutoSize value={team.name} onChange={e => onNameChange(e.currentTarget.value)} />
            {showDeleteButton && <button onClick={onDelete}>🗑</button>}
            <button class="addNew" onClick={() => addPerson({ name: "New Person", friends: [] })}>+ 🧍</button>
        </h3>
        {team.people.map((person, indexP) =>
            <PersonElem onRemove={_ => removePerson(indexP)}
                onDrop={(_, sourceTeam) => {
                    if (sourceTeam != teamIndex) {
                        removePerson(indexP);
                    }
                }}
                teamIndex={teamIndex}
                person={person}
                onChangeName={(p, newName) => {
                    const newTeam = { ...team }
                    newTeam.people[indexP].name = newName;
                    onChange(newTeam);
                }}
            />
        )}
    </div >
}