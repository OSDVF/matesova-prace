import { Component, JSX } from "preact";
import '../styles/teams.scss'
import classNames from "classnames";
import { useContext } from "preact/hooks";
import { AppStateContext } from "../plugins/state";
import { application } from "../api/api.types";
import { Link } from "preact-router";
import Routes from "../plugins/routes";
import linkState from "linkstate";
import { Person } from "../components/Person";
import TeamElem, { Team } from "../components/Team";
import { DndProvider } from 'react-dnd-multi-backend'
import { HTML5toTouch } from 'rdndmb-html5-to-touch'

type Props = {

};
type State = {
    teams: Team[],
    targetPeopleCount: number
};
export default class Teams extends Component<Props, State> {
    private dragging = false;

    constructor(props: Props) {
        super(props)

        this.state = {
            teams: [],
            targetPeopleCount: 7
        }
    }

    removePerson(team: number, person: number) {
        const teams = this.state.teams;
        teams[team].people.splice(person, 1);
        this.setState({ teams });
    }

    static arrayRange(start: number, stop: number, step: number) {
        return Array.from(
            { length: (stop - start) / step + 1 },
            (value, index) => start + index * step
        );
    }

    randomize(applications: application[]) {
        const indexesToVisit = Teams.arrayRange(0, applications.length - 1, 1);
        const teams: Team[] = [];
        while (indexesToVisit.length > 0) {
            const pickedIndex = getRandomInt(0, indexesToVisit.length - 1);
            let pickedPerson = applications[indexesToVisit[pickedIndex]];
            indexesToVisit.splice(pickedIndex, 1);
            let currentTeam = teams[teams.length - 1]
            if (currentTeam == null || currentTeam.people.length >= this.state.targetPeopleCount) {
                teams.push({
                    name: 'Team ' + (teams.length + 1).toString(),
                    people: []
                })
                currentTeam = teams[teams.length - 1];
            }

            currentTeam.people.push({ name: pickedPerson.name + ' ' + pickedPerson.sname, friends: [] });
        }
        this.setState({
            teams
        });
    }

    private subscribed = false;

    render(props: Readonly<Props>, state: State) {
        const globalState = useContext(AppStateContext);
        if (!this.subscribed) {
            this.subscribed = true;
            globalState.onChange = () => this.setState({});
        }

        return <>
            <div class="no-print">
                <h1>Teams</h1>
                <Link href={Routes.link(Routes.Home)}>Back to home</Link>
            </div>
            {globalState.applications !== null ? <>
                <div class="no-print">
                    <button onClick={() => this.randomize(globalState.applications!)}>Randomize</button>
                    <br />
                    <label>
                        Target people count in one team:&nbsp;
                        <input type="text" size={4} value={state.targetPeopleCount} onChange={linkState(this, 'targetPeopleCount')} />
                    </label>
                </div>
                <div class="teams">
                    <DndProvider options={HTML5toTouch}>
                        {
                            state.teams.map((team, indexT) =>
                                <TeamElem
                                    teamIndex={indexT}
                                    onNameChange={n => {
                                        const teams = [...state.teams];
                                        teams[indexT].name = n
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    onChange={t => {
                                        const teams = [...state.teams];
                                        teams[indexT] = t;
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    showDeleteButton={state.teams.length > 1}
                                    team={team}
                                />
                            )}
                    </DndProvider>
                </div ></> :
                <>Loading applications</>
            }
        </>
    }
    onDropPerson(evt: JSX.TargetedDragEvent<HTMLDivElement>, indexT: number, indexP: number): void {
        this.dragging = false;
        if (evt.dataTransfer == null) return;
        const { draggedT, draggedP } = JSON.parse(
            evt.dataTransfer.getData('indexes')
        );

        var draggedPerson = this.state.teams[draggedT]?.people[draggedP];
        if (!this.state.teams[indexT].people) {
            this.state.teams[indexT].people = [];
        }
        const draggedF = undefined;
        if (typeof draggedF != 'undefined') {
            if (!this.state.teams[indexT].people[indexP].friends) {
                this.state.teams[indexT].people[indexP].friends = [];
            }
            this.state.teams[indexT].people[indexP].friends.push(
                draggedPerson.friends[draggedF]
            );
            draggedPerson.friends.splice(draggedF, 1);
        }
        else {
            if (indexT == draggedT && indexP == draggedP) {
                return;//Dragged to same person
            }

            // Flatten friends array
            var friendsToAdd: Person[] = [];
            if (draggedPerson.friends?.length > 0) {
                friendsToAdd = draggedPerson.friends;
            }
            if (!this.state.teams[indexT].people[indexP].friends) {
                this.state.teams[indexT].people[indexP].friends = [];
            }
            this.state.teams[indexT].people[indexP].friends.push(
                {
                    name: draggedPerson.name,
                    friends: []
                }
            );
            for (var previousFriend of friendsToAdd) {
                this.state.teams[indexT].people[indexP].friends.push(
                    previousFriend);
            }
            this.state.teams[draggedT].people.splice(draggedP, 1);
        }
    }
    startDrag(evt: JSX.TargetedDragEvent<HTMLDivElement>, indexT: number, indexP: number): void {
        if (!this.dragging) {
            this.dragging = true;
            if (evt.dataTransfer != null) {
                evt.dataTransfer.dropEffect = 'move'
                evt.dataTransfer.effectAllowed = 'move'
                evt.dataTransfer.setData('indexes', JSON.stringify(
                    {
                        draggedT: indexT,
                        draggedP: indexP
                    }
                ));
            }
        }
    }
    onDropTeam(evt: JSX.TargetedDragEvent<HTMLDivElement>, indexT: any): void {
        this.dragging = false;
        if (evt.dataTransfer == null) return;
        const { draggedT, draggedP, draggedF } = JSON.parse(
            evt.dataTransfer.getData('indexes')
        );

        var draggedPerson = (this.state.teams[draggedT]?.people ?? [])[draggedP];
        if (!this.state.teams[indexT].people) {
            this.state.teams[indexT].people = [];
        }
        if (typeof draggedPerson != 'undefined') {
            //If the dragged item still exists
            if (draggedT == indexT)
                return;//Dragged to same team

            if (typeof draggedF != 'undefined') {
                if (!draggedPerson.friends) {
                    draggedPerson.friends = [];
                }
                var draggedFriend = draggedPerson.friends[draggedF];
                if (typeof draggedFriend != 'undefined') {
                    this.state.teams[indexT].people.push(
                        draggedFriend
                    );
                    this.state.teams[draggedT].people[draggedP].friends.splice(draggedF, 1);
                }
            }
            else {
                this.state.teams[indexT].people.push(
                    this.state.teams[draggedT].people[draggedP]
                );
                this.state.teams[draggedT].people.splice(draggedP, 1);
            }
        }
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}