export function DisplayError(props: { error: any }) {
    let children = () => {
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
    };

    return (
        <div class="ln-error">
            {children()}
        </div>
    );
}