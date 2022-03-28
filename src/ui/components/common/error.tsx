import { createMemo } from "solid-js";

export function DisplayError(props: { error: any }) {
    let children = createMemo(() => {
        let error = props.error;
        if(error instanceof Error) {
            return (
                <>
                    <div textContent={error.name} />
                    <div textContent={error.message} />
                    <pre textContent={error.stack} />
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