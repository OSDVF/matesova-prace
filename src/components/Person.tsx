import classNames from "classnames";

export default function Person()
{
    return <div class={classNames({
        person: true
    })} draggable={true}
        onDragStart={e => this.startDrag(e, indexT, indexP)}
        onDrop={e => this.onDropPerson(e, indexT, indexP)}
        onDragOver={e => e.preventDefault()}
        onDragEnter={e => e.preventDefault()}
    >
        <img
            src="/person.svg"
            alt="Osoba"
        />
        <span>{person.name}</span>&ensp;
        <button onClick={() => this.removePerson(indexT, indexP)}>🗑</button>
        <br />
    </div >
}