import { TableField } from "../components/Table";
import { application } from "../api/api.types";
import { keys } from 'ts-transformer-keys'

const fieldDef: Partial<TableField>[] = [
  {
    text: "ID",
    show: false
  },
  {
    text: 'Jméno'
  },
  {
    text: 'Příjmení'
  },
  {
    text: 'Věk'
  },
  {
    text: 'Email'
  },
  {
    text: 'Telefon'
  },
  {
    text: 'Město'
  },
  {
    text: 'Hudební nástroj'
  },
  {
    text: 'Poprvé'
  },
  {
    text: 'Kdo pozval'
  },
  {
    text: 'Zdravotní omezení'
  },
  {
    text: 'Jídelní omezení'
  },
  {
    text: 'Poznámka'
  },
  {
    text: '_',
    show: false
  },
  {
    text: 'Kategorie'
  },
  {
    text: 'Příjezd'
  },
  {
    text: 'První jídlo'
  },
  {
    text: 'Odjezd'
  },
  {
    text: 'Poslední'
  },
  {
    text: 'Zakoupené bonusy'
  },
  {
    text: 'Stav přihášky'
  },
  {
    text: 'Cena za noc'
  },
  {
    text: 'Cena'
  },
  {
    text: 'Interní poznámka'
  },
  {
    text: 'Datum přihlášení'
  },
  {
    text: 'Cena za bonusy'
  },
];

export const fields: TableField[] = fieldDef.map((def, index) => ({
  text: def.text ?? '',
  show: def.show ?? true,
  propName: keys<application>()[index]
}));