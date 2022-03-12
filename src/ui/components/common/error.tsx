import { createMemo } from "solid-js";

export function DisplayError(props: { error: any }) {
    let children = createMemo(() => {
        let error = props.error;
        if(error instanceof Error) {
            return (
                <>
                    <div>{error.name}</div>
                    <div>{error.message}</div>
                    <pre>{error.stack}</pre>
                </>
            )
        } else {
            return error.toString();
        }
    });

    return (
        <div className="ln-error">
            {children()}
        </div>
    );
}