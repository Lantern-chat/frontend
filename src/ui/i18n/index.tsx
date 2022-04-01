import { navigatorDetector, queryStringDetector } from "typesafe-i18n/detectors";

export const DETECTORS = [
    navigatorDetector,
];

if(__DEV__) {
    DETECTORS.unshift(queryStringDetector);
}