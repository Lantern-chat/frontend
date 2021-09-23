import { useEffect } from "react";

export function useTitle(title?: string) {
    useEffect(() => {
        if(title) {
            let before = document.title;
            document.title = title;
            return () => { document.title = before; };
        }
        return () => { };
    }, [title]);
}