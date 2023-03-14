import { FunctionComponent } from 'preact'

type Field = {
    text: string;
    class: string;
};

type Props = {
    fields: Array<Field>;
    data: Array<Array<string>>
};


export function Table({ data, fields }: Props) {
    return <table>
        <thead>
            <tr>
                {fields.map((field) => {
                    <th class={field.class}>{field.text}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {data.map((row) => {
                row.map((item) => {
                    <td>{item}</td>
                })
            })}
        </tbody>
    </table>
}