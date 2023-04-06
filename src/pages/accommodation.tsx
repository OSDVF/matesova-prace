import { Component } from "preact";
import { DateDiff } from "../plugins/date-diff";
import { keys } from "ts-transformer-keys";
import { useContext } from "preact/hooks";
import { AppStateContext } from "../plugins/state";
import { ApplicationState, application } from "../api/api.types";
import InputAutoSize from "../components/InputAutoSize";
import linkState from "linkstate";
import { Link } from "preact-router";
import Routes from "../plugins/routes";

type Props = {

};
type State = {
    applications: Schema[],
    showNotes: boolean
}

interface SchemaInterface {
    Jméno: string;
    Příjmení: string;
    Věk: number;
    Bydliště: string;
    Cena: number;
    Příjezd: Date | string;
    Odjezd: Date | string;
    'Zaplaceno': number | null;
    'Zbývá zaplatit': number | null;
    'Sleva/Podpora': string;
    Poznámka: string | undefined;
}

class Schema implements SchemaInterface {
    constructor(input: SchemaInterface) {
        for (let key in input) {
            this[key as keyof typeof this] = input[key as keyof typeof input] as any;
        }
    }

    public Jméno!: string;
    public Příjmení!: string;
    public Věk!: number;
    public Bydliště!: string;
    public Cena!: number;
    public Příjezd!: Date | string;
    public Odjezd!: Date | string;
    'Nocí'(): number {
        if (typeof this.Příjezd == 'string') {
            this.Příjezd = new Date(Date.parse(this.Příjezd));
        }
        if (typeof this.Odjezd == 'string') {
            this.Odjezd = new Date(Date.parse(this.Odjezd));
        }
        return DateDiff.inDays(this.Příjezd, this.Odjezd);
    }
    public 'Zaplaceno'!: number | null;
    public 'Zbývá zaplatit'!: number | null;
    'Sleva/Podpora': string;
    public Poznámka!: string;
}

const schemaKeys = keys<Schema>();
const stateToRemainingPrice = {
    'cancelled': () => 0,
    'paid': () => 0,
    'free': () => 0,
    'new': (fullPrice: number) => fullPrice
};
const schemaWidth = {
    Podpis: 200
};

export default class Accommodation extends Component<Props, State> {
    private subscribed = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            applications: [],
            showNotes: false
        };
    }

    loadApplications(apps: application[]) {
        const destApps: Schema[] = [];
        for (const sourceApp of apps) {
            if (sourceApp.state != ApplicationState.cancelled) {
                const remain = stateToRemainingPrice[sourceApp.state as keyof typeof stateToRemainingPrice](sourceApp.price);
                destApps.push(new Schema({
                    "Zbývá zaplatit": remain,
                    Zaplaceno: sourceApp.price - remain,
                    Cena: sourceApp.price,
                    Jméno: sourceApp.name,
                    Příjmení: sourceApp.sname,
                    Bydliště: sourceApp.town,
                    Odjezd: new Date(sourceApp.departure),
                    Příjezd: new Date(sourceApp.arrival),
                    Věk: sourceApp.age,
                    "Sleva/Podpora": '',
                    Poznámka: this.state.showNotes ? sourceApp.note_internal : undefined
                }));
            }
        }
        this.setState({
            applications: destApps
        })
    }

    render(props: Props, state: State) {
        const globalState = useContext(AppStateContext);
        if (!this.subscribed) {
            this.subscribed = true;
            globalState.onChange = () => this.setState({});
        }

        let selectedSchemaKeys = schemaKeys;
        if (!state.showNotes) {
            selectedSchemaKeys = selectedSchemaKeys.filter(p => p != 'Poznámka')
        }

        return <>
            <div class="no-print">
                <Link href={Routes.link(Routes.Home)}>〈 Back to application list</Link>
                <br />
                {globalState.applications != null ?
                    <><button onClick={() => this.loadApplications(globalState.applications!)}>Load with applications</button>
                        <label><input type="checkbox" checked={state.showNotes} onChange={linkState(this, 'showNotes')} /> Show notes</label>
                        <br />
                        {false ? <button>Save to the server</button> :
                            'Saved locally'
                        }
                    </> : 'Loading applications'
                }
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        {
                            schemaKeys.map(k =>
                                state.applications.length > 0 && typeof state.applications[0][k] != 'undefined' &&
                                <th style={{ width: schemaWidth[k as keyof typeof schemaWidth] }}>{k.toString()}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>

                    {state.applications.map((a, ai) =>
                        <tr>
                            <td>{ai + 1}</td>
                            {
                                schemaKeys.map(k =>
                                    typeof a[k] != 'undefined' &&
                                    <td>
                                        <InputAutoSize value={typeof a[k] == 'function' ? (a[k] as () => number)() : typeof a[k] == 'object' && a[k] != null ? toMontString(a[k] as Date) : a[k]?.toString()} onChange={e => {
                                            const a = state.applications[ai];
                                            (a[k] as string) = e.currentTarget.value;
                                            this.setState({});
                                        }} />
                                    </td>)
                            }
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    }
}

function toMontString(date: Date): string {
    const month = date.getMonth();
    const day = date.getDate();
    return `${day}. ${month}.`;
}