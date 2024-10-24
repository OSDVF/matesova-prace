/**
 * Event from Fetch
 */
export type futureEvent = {
    eventID: number
    registration: number | boolean
    appBegin: string
    appEnd: string
    begin: string
    end: string
    title: string
    slug: string
    desc: string
};

export enum Meal {
    VECERE = "VECERE", SNIDANE = "SNIDANE", OBED = "OBED"
}

export enum ApplicationState {
    new = "new",
    confirmed = "confirmed",
    waiting = "waiting",
    paid = "paid",
    free = "free",
    cancelled = "cancelled"

}

export type application = {
    appID: number,
    name: string,
    sname: string,
    age: number,
    email: string,
    phone: string,
    town: string,
    music_instrument: string,
    firsttime: string,
    firsttime_note: string,
    note_health: string,
    note_food: string,
    note: string,
    wholeevent: string,
    group: number,
    arrival: Date,
    first_meal: Meal,
    departure: Date,
    last_meal: Meal,
    extras: string,
    state: ApplicationState,
    night_price: number,
    price: number,
    note_internal: string,
    appdate: Date,
    extras_price: number | null,
    confirmation_sent: boolean
};

export type futureEventInData = {
    events: futureEvent[]
};

export type TSelectOption = {
    text: string
    key: number
    value: number
};

export type formConfig = {
    groups: TSelectOption[]
    items: TSelectOption[]
    departures: TSelectOption[]
    arrivals: TSelectOption[]
};

export type TeamData = {
    eventID: number,
    teamID: number,
    name: string,
    data: string
};

export type TeamsData = {
    teams: TeamData[]
}

export type TeamUpdateResponse = {
    created: number[],
    updated: number[],
    deleted: number[]
}

export type ResendMailResponse = {
    sent: number | false,
}