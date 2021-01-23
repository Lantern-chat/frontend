import { useEffect } from "preact/hooks";

export function useTitle(title: string) {
    useEffect(() => {
        let before = document.title;
        document.title = title;
        return () => document.title = before;
    }, [title]);
}