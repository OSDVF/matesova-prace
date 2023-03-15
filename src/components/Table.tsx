import '../styles/table.scss'

export type TableField = {
    text: string;
    class: string;
};

type Props<T> = {
    fields: Array<TableField>;
    data: T[]
};


export function Table<T>({ data, fields }: Props<T>) {
    return <table>
        <thead>
            <tr>
                {fields.map((field) => {
                    return <th class={field.class}>{field.text}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {data.map((row) => {
                const items: preact.JSX.Element[] = [];
                for (let property in row) {
                    items.push(<td>{row[property]!}</td>);
                }
                return <tr>{items}</tr>;
            })}
        </tbody>
    </table>
}