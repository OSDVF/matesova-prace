import { Component } from "preact";
import '../styles/teams.scss'
import { useContext } from "preact/hooks";
import { AppStateContext } from "../plugins/state";
import { ApplicationState, application } from "../api/api.types";
import { Link } from "preact-router";
import Routes from "../plugins/routes";
import linkState from "linkstate";
import TeamElem, { Team } from "../components/Team";
import { DndProvider } from 'react-dnd-multi-backend'
import { HTML5toTouch } from 'rdndmb-html5-to-touch'
import ApiLayer from "../api/api";

type Props = {

};
type State = {
    teams: Team[] | null,
    targetPeopleCount: number,
    includeCancelled: boolean
};
export default class Teams extends Component<Props, State> {
    private dragging = false;

    constructor(props: Props) {
        super(props)

        this.state = {
            includeCancelled: false,
            teams: null,
            targetPeopleCount: 7
        }
    }

    removePerson(team: number, person: number) {
        const teams = this.state.teams;
        teams![team].people.splice(person, 1);
        this.setState({ teams });
    }

    static arrayRange(start: number, stop: number, step: number) {
        return Array.from(
            { length: (stop - start) / step + 1 },
            (value, index) => start + index * step
        );
    }

    randomize(applications: application[]) {
        if(!this.state.includeCancelled)
        {
            applications = applications.filter(a => a.state != ApplicationState.cancelled);
        }
        const indexesToVisit = Teams.arrayRange(0, applications.length - 1, 1);
        const teams: Team[] = [];
        while (indexesToVisit.length > 0) {
            const pickedIndex = getRandomInt(0, indexesToVisit.length - 1);
            let pickedPerson = applications[indexesToVisit[pickedIndex]];
            indexesToVisit.splice(pickedIndex, 1);
            let currentTeam = teams[teams.length - 1]
            if (currentTeam == null || currentTeam.people.length >= this.state.targetPeopleCount) {
                teams.push({
                    id: null,
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

    addMissing(applications: application[]) {
        let pickedTeam = 0;
        const teams = [...this.state.teams!]
        const filtered = this.state.includeCancelled ? applications :
            applications.filter(a => a.state != ApplicationState.cancelled);
        for (let application of filtered) {
            //add missing people
            let found = false;
            for (let team of teams) {
                for (let person of team.people) {
                    if (person.name == application.name + ' ' + application.sname) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
            if (!found) {
                teams[pickedTeam].people.push({ name: application.name + ' ' + application.sname, friends: [] });
                pickedTeam = (pickedTeam + 1) % this.state.teams!.length;
            }
        }
    }

    addNewTeam() {
        const teams = [...this.state.teams!];
        teams.push({
            name: "New Team",
            people: [{
                name: "New Person",
                friends: []
            }],
            id: null
        })
        this.setState({ teams });
    }
    private subscribed = false;

    render(props: Readonly<Props>, state: State) {
        const globalState = useContext(AppStateContext);
        if (!this.subscribed) {
            this.subscribed = true;
            globalState.onChange = () => this.setState({});
        }

        if (state.teams == null && globalState.selectedEventID != null) {
            ApiLayer.getTeams(globalState.selectedEventID).then(response => {
                const teams: Team[] = [];
                if (response.data.teams != null) {
                    for (let team of response.data.teams) {
                        teams.push({
                            id: team.teamID,
                            name: team.name,
                            people: JSON.parse(team.data)
                        })
                    }
                }
                this.setState({
                    teams
                })
            });
        }

        return <>
            <div class="no-print">
                <h1>Teams</h1>
                <Link href={Routes.link(Routes.Home)}>〈 Back to applications list</Link>
            </div>
            {globalState.applications !== null ? <>
                <div class="no-print">
                    <button onClick={() => this.randomize(globalState.applications!)}>Randomize</button>
                    <button onClick={() => this.addNewTeam()}>+ Team</button>
                    <br />
                    <label>
                        Target people count in one team:&nbsp;
                        <input type="text" size={4} value={state.targetPeopleCount} onChange={linkState(this, 'targetPeopleCount')} />
                    </label>
                    <br />
                    <label>
                        Include cancelled applications:&nbsp;
                        <input type="checkbox" checked={state.includeCancelled} onChange={linkState(this, 'includeCancelled')} />
                    </label>
                </div>
                <div class="teams">
                    <DndProvider options={HTML5toTouch}>
                        {
                            state.teams?.map((team, indexT) =>
                                <TeamElem
                                    teamIndex={indexT}
                                    onNameChange={async n => {
                                        const teams = [...state.teams!];
                                        teams[indexT].name = n
                                        if (team.id == null) {
                                            const result = await ApiLayer.updateTeams(globalState.selectedEventID!, null, [JSON.stringify(team.people)], [n]);
                                            if (result.data.created.length > 0) {
                                                teams[indexT].id = result.data.created[0];
                                            }
                                        }
                                        else {
                                            ApiLayer.updateTeams(globalState.selectedEventID!, [team.id], null, [n]);
                                        }
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    onChange={async t => {
                                        const teams = [...state.teams!];
                                        teams[indexT] = t;
                                        if (t.id == null) {
                                            const result = await ApiLayer.updateTeams(globalState.selectedEventID!, null, [JSON.stringify(t.people)], [t.name]);
                                            if (result.data.created.length > 0) {
                                                teams[indexT].id = result.data.created[0];
                                            }
                                        }
                                        else {
                                            ApiLayer.updateTeams(globalState.selectedEventID!, [t.id], [JSON.stringify(t.people)], [t.name]);
                                        }
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    onDrop={async (p, sourceTeam) => {
                                        const teams = [...state.teams!];
                                        teams[sourceTeam].people = teams[sourceTeam].people.filter(x => x.name != p.name);
                                        if (teams[sourceTeam].id == null) {
                                            const result = await ApiLayer.updateTeams(globalState.selectedEventID!, null, [JSON.stringify(teams[sourceTeam].people)], [teams[sourceTeam].name]);
                                            if (result.data.created.length > 0) {
                                                teams[indexT].id = result.data.created[0];
                                            }
                                        }
                                        else {
                                            ApiLayer.updateTeams(globalState.selectedEventID!, [teams[sourceTeam].id!], [JSON.stringify(teams[sourceTeam].people)], [teams[sourceTeam].name]);
                                        }
                                    }}
                                    showDeleteButton={true}
                                    onDelete={async () => {
                                        const teams = [...state.teams!];
                                        teams.splice(indexT, 1);
                                        if (team.id != null) {
                                            ApiLayer.updateTeams(globalState.selectedEventID!, [team.id], [], []);
                                        }
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    team={team}
                                />
                            )}
                    </DndProvider>
                </div ></> :
                <>Loading applications</>
            }
        </>
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