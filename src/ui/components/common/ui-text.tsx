export interface UITextProps {
    text: string,
}

export function UIText(props: UITextProps) {
    return <span className="ui-text" textContent={props.text} />
}