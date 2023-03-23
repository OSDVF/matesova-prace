/**
 * Event from Fetch
 */
export type futureEvent = {
    eventID: number
    registration: number | boolean
    appBegin: string
    appEnd: string
    title: string
    slug: string
    desc: string
};

export enum Meal {
    VECERE, SNIDANE, OBED
}

export enum ApplicationState {
    new, confirmed, waiting, paid, free, cancelled
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
    note_internal:string,
    appdate: Date,
    extras_price: number | null
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