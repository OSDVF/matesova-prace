import { Component } from "preact";
import '../styles/teams.scss'
import { useContext } from "preact/hooks";
import { AppStateContext } from "../plugins/state";
import { ApplicationState, application, futureEvent } from "../api/api.types";
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

    randomize(applications: application[], event: futureEvent) {
        if (!this.state.includeCancelled) {
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

            let name = createName(pickedPerson, event);
            currentTeam.people.push({ name, friends: [] });
        }

        this.setState({
            teams
        });
    }

    async addMissing(applications: application[], event: futureEvent) {
        let pickedTeam = 0;
        const teams = [...this.state.teams!]
        const dirtyTeams = new Set<number>();
        if (!teams.length) {
            teams.push({
                id: null,
                name: 'Team 1',
                people: []
            });
        }
        const filtered = this.state.includeCancelled ? applications :
            applications.filter(a => a.state != ApplicationState.cancelled);
        
        for (let application of filtered) {
            //add missing people
            let found = false;
            for (let team of teams) {
                for (let person of team.people) {
                    if (person.name.includes(application.name + ' ' + application.sname)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
            if (!found) {
                let name = createName(application, event);
                teams[pickedTeam].people.push({ name, friends: [] });
                dirtyTeams.add(pickedTeam);
                pickedTeam = (pickedTeam + 1) % this.state.teams!.length;
            }
        }

        for (let team of dirtyTeams) {
            await this.updateTeam(teams[team], event.eventID);
        }

        this.setState({
            teams
        });
    }

    addNewTeam() {
        const teams = [...this.state.teams!];
        teams.push({
            name: "New Team",
            people: [],
            id: null
        })
        this.setState({ teams });
    }

    async updateTeam(t: Team, eventID: number, setState = false) {
        if (t.id == null) {
            const result = await ApiLayer.updateTeams(eventID, null, [JSON.stringify(t.people)], [t.name]);
            if (result.data.created.length > 0) {
                t.id = result.data.created[0];
                if (setState) {
                    this.setState({
                        teams: this.state.teams
                    });
                }
            }
        }
        else {
            ApiLayer.updateTeams(eventID, [t.id], [JSON.stringify(t.people)], [t.name]);
        }
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
        const selectedEvent = globalState.events.find(e => e.eventID == globalState.selectedEventID)

        return <>
            <div class="no-print">
                <h1>Teams</h1>
                <Link href={Routes.link(Routes.Home)}>〈 Back to applications list</Link>
            </div>
            {globalState.applications !== null && selectedEvent ? <>
                <div class="no-print">
                    <button onClick={() => this.randomize(globalState.applications!, selectedEvent)}>Randomize</button>
                    <button onClick={() => this.addNewTeam()}>+ Team</button>
                    <button onClick={() => this.addMissing(globalState.applications!, selectedEvent)}>+ Missing</button>
                    <button onClick={() => download(`teams-${new Date().toLocaleString()}.json`, JSON.stringify(this.state.teams, null, 2)) }>➡️ Export</button>&ensp;
                    <label htmlFor="import">
                        Import:
                    </label>
                    <input id="import" type="file" onChange={async e => {
                        const file = e.currentTarget?.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = async e => {
                                const text = e.target?.result as string;
                                const teams = JSON.parse(text);
                                for (let team of teams) {
                                    if (!this.state.teams?.find(t => t.id == team.id)) {
                                        team.id = null;
                                    }
                                    await this.updateTeam(team, globalState.selectedEventID!);
                                }

                                this.setState({ teams });
                                alert('Imported ' + teams.length + ' teams');
                            }
                            reader.readAsText(file);
                        }
                    }} />
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
                                        const t = teams[indexT]
                                        t.name = n
                                        await this.updateTeam(t, globalState.selectedEventID!);
                                        teams[indexT] = t;
                                        
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    onChange={async t => {
                                        const teams = [...state.teams!];
                                        await this.updateTeam(t, globalState.selectedEventID!);
                                        teams[indexT] = t;
                                        
                                        this.setState({
                                            teams
                                        })
                                    }}
                                    onDrop={async (p, sourceTeam) => {
                                        // Remove from the source team
                                        const teams = [...state.teams!];
                                        const t =teams[sourceTeam]
                                        t.people = t.people.filter(x => x.name != p.name);
                                        await this.updateTeam(t, globalState.selectedEventID!);
                                        teams[sourceTeam] = t;
                                        this.setState({
                                            teams
                                        })

                                        // Adding to the target is handled in onChange
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

function createName(person: application, event: futureEvent) {
    let name = person.name + ' ' + person.sname;
    let late = false;
    if (person.arrival > new Date(event.begin)) {
        name += ` ${person.arrival.getDate()}${(person.first_meal?.[0] ?? '').toLowerCase()}-`;
        late = true;
    }
    const end = new Date(event.end)
    end.setHours(0, 0, 0, 0)
    if (person.departure < end) {
        name += `${late ? '' : ' -'}${person.departure.getDate()}${(person.last_meal?.[0] ?? '').toLowerCase()}`;
    }
    return name;
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

function download(filename: string, text: string) {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
}