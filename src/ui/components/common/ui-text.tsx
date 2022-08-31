export interface UITextProps {
    text: string,
}

export const UIText = (props: UITextProps) => (<span class="ui-text" textContent={props.text} />);
