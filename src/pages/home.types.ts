import { TableField } from "../components/Table";
import { application } from "../api/api.types";

const fieldDef: (Partial<TableField<application>>)[] = [
    {
      text: "ID",
      show: false,
      propName: "appID"
    },
    {
      text: 'Jméno',
      propName: 'name'
    },
    {
      text: 'Příjmení',
      propName: 'sname'
    },
    {
      text: 'Věk',
      propName: 'age'
    },
    {
      text: 'Email',
      propName: 'email'
    },
    {
      text: 'Telefon',
      propName: 'phone'
    },
    {
      text: 'Město',
      propName: 'town'
    },
    {
      text: 'Hudební nástroj',
      propName: 'music_instrument'
    },
    {
      text: 'Poprvé',
      propName: 'firsttime'
    },
    {
      text: 'Kdo pozval',
      propName: 'firsttime_note'
    },
    {
      text: 'Zdravotní omezení',
      propName: 'note_health'
    },
    {
      text: 'Jídelní omezení',
      propName: 'note_food'
    },
    {
      text: 'Poznámka',
      propName: 'note'
    },
    {
      text: '_',
      show: false,
      propName: 'wholeevent'
    },
    {
      text: 'Kategorie',
      propName: 'group'
    },
    {
      text: 'Příjezd',
      propName: 'arrival'
    },
    {
      text: 'První jídlo',
      propName: 'first_meal'
    },
    {
      text: 'Odjezd',
      propName: 'departure'
    },
    {
      text: 'Poslední',
      propName: 'last_meal'
    },
    {
      text: 'Zakoupené bonusy',
      propName: 'extras'
    },
    {
      text: 'Stav přihášky',
      propName: 'state'
    },
    {
      text: 'Cena za noc',
      propName: 'night_price'
    },
    {
      text: 'Cena',
      propName: 'price'
    },
    {
      text: 'Interní poznámka',
      propName: 'note_internal'
    },
    {
      text: 'Datum přihlášení',
      propName: 'appdate'
    },
    {
      text: 'Cena za bonusy',
      propName: 'extras_price'
    },
    {
      text: 'Potvrzení odesláno',
      propName: 'confirmation_sent'
    }
  ];

export const fields: TableField<application>[] = fieldDef.map((def, index) => ({
  text: def.text ?? '',
  show: def.show ?? true,
  propName: def.propName!
}));