
export interface ErrorDetail {
    errorKey: string,
    errorMessageCanonical: string,
    errorMessageTranslated?: string
}

export interface ErrorResponseBody {
    statusCode: number,
    errorDetails: Array<ErrorDetail>
}