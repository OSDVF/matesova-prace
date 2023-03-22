import { Component, ComponentChild } from "preact";
import { createPortal } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import { Menu } from "./Menu";

type Props = {
    checkbox?: boolean,
    checked?: boolean,
    actions?: TableAction[],
    onUncheck?: () => void,
    onChange?: JSXInternal.GenericEventHandler<HTMLInputElement>,
    afterText?: string
};

type State = {
    checked: boolean,
    toggleState: boolean,
    lastClick: {
        left: number,
        top: number
    }
};

export type TableAction = {
    onClick: () => void,
    text: string,
    icon?: string
};

export class TableRow extends Component<Props, State> {
    constructor(props?: Props) {
        super(props);
        this.state = {
            checked: props?.checked ?? false,
            toggleState: false,
            lastClick: {
                left: 0,
                top: 0
            }
        }
    }

    setChecked(checked: boolean) {
        this.setState({
            checked: checked
        });
    }

    render(props: Props, state: Readonly<State>): ComponentChild {
        const showActions = (props.actions ?? false);

        const indexColContent: preact.JSX.Element[] = [];
        if (showActions) {
            indexColContent.push(<input type="checkbox" checked={state.checked} onChange={e => {
                const newState = e.currentTarget.checked;
                this.setState({
                    checked: newState
                })
                if (!newState && props.onUncheck != null) {
                    props.onUncheck();
                }
                if (props.onChange) {
                    props.onChange(e);
                }
            }} />);
        }
        const actionMenuToggle = (e: any) => {
            if (e.target == e.currentTarget) {
                this.setState({
                    toggleState: !state.toggleState,
                    lastClick: {
                        left: e.pageX,
                        top: e.pageY
                    }
                });
                e.preventDefault();
                return false;
            }
        };
        return <div onClick={actionMenuToggle} onContextMenu={actionMenuToggle}>
            {indexColContent}
            {props.afterText}
            {
                state.toggleState ? createPortal(
                    <Menu {...state.lastClick} items={
                        props.actions?.map(val => ({
                            onClick: e => val.onClick(),
                            text: val.text
                        }))
                    } />, document.body
                ) : null
            }
        </div>;
    }
}