import { Component, ComponentChild, RenderableProps } from "preact";
import { forwardRef, useImperativeHandle } from "preact/compat";

type Props = {
    checkbox?: boolean,
    actions?: TableAction[],
    onUncheck?: () => void
};

type State = {
    checked: boolean
};

export type TableAction = {
    onClick: () => void,
    text: string,
    icon: string
};

export class TableRow extends Component<Props, State> {

    setChecked(checked: boolean) {
        this.setState({
            checked: checked
        });
    }

    render(props: Props, state: Readonly<State>): ComponentChild {
        const showActions = (props.actions ?? false);

        let indexColContent: preact.JSX.Element[] = [];
        if (showActions) {
            indexColContent.push(<input type="checkbox" checked={state.checked} onChange={e => {
                const newState = e.currentTarget.checked;
                this.setState({
                    checked: newState
                })
                if (!newState && props.onUncheck != null) {
                    props.onUncheck();
                }
            }} />);
        }

        return indexColContent;
    }
}