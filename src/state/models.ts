import { ApiError } from "../../../backend/crates/models/codes";

export * from "../../../backend/crates/models/models";
export * from "../../../backend/crates/models/codes";

export function errorCodeToi18n(err: ApiError): string {
    return ""; // TODO
}