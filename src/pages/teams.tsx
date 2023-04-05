import { Component } from "preact";
import '../styles/teams.scss'
import classNames from "classnames";
import { useContext } from "preact/hooks";
import { AppStateContext } from "../plugins/state";
import { application } from "../api/api.types";
import { Link } from "preact-router";
import Routes from "../plugins/routes";
import linkState from "linkstate";

type Team = {
    name: string,
    people: string[]
}

type Props = {

};
type State = {
    teams: Team[],
    targetPeopleCount: number
};
export default class Teams extends Component<Props, State> {

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

            currentTeam.people.push(pickedPerson.name + ' ' + pickedPerson.sname);
        }
        this.setState({
            teams
        });
    }

    private subscribed = false;

    render(props: Readonly<Props>, state: Readonly<State>) {
        const globalState = useContext(AppStateContext);
        if (!this.subscribed) {
            this.subscribed = true;
            globalState.onChange = () => this.setState({});
        }

        return <>
            <h1>Teams</h1>
            <Link href={Routes.Home}>Back to home</Link><br />
            {globalState.applications !== null ? <>
                <button onClick={() => this.randomize(globalState.applications!)}>Randomize</button>
                <br />
                <label>
                    Target people count in one team:&nbsp;
                    <input type="text" size={4} value={state.targetPeopleCount} onChange={linkState(this, 'targetPeopleCount')} />
                </label>
                <div class="teams">
                    {
                        state.teams.map((team, indexT) => <div>
                            <h3><input type="text" value={team.name} onChange={e => {
                                const teams = state.teams;
                                teams[indexT].name = e.currentTarget.value || team.name
                                this.setState({
                                    teams
                                })
                            }} />
                                {state.teams.length > 1 && <button>🗑</button>}
                            </h3>
                            {team.people.map((person, indexP) =>
                                <div class={classNames({
                                    person: true
                                })} draggable={true}>
                                    <img
                                        src="/person.svg"
                                        alt="Osoba"
                                    />
                                    <span>{person}</span>&ensp;
                                    <button onClick={() => this.removePerson(indexT, indexP)}>🗑</button>
                                    <br />
                                </div >
                            )}
                        </div >
                        )}
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