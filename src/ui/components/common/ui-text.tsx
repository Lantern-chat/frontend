export interface UITextProps {
    text: string,
}

export function UIText(props: UITextProps) {
    return <span class="ui-text" textContent={props.text} />
}