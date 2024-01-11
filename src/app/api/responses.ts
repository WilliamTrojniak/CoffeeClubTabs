import { ZodFormattedError } from "zod"

type SuccessResponse<T> = {
  status: 200,
  data: T,
  message?: string
}

type ClientFormattingErrorResponse<T> = {
  status: 400,
  data: ZodFormattedError<T>
  message: string
}

type ErrorResponse = {
  status: 401 | 403 | 404 | 409 | 500,
  message: string
}

export type Response<T> = SuccessResponse<T> | ClientFormattingErrorResponse<T> | ErrorResponse; 

export const generalClientSuccess = <T>(data: T): Response<T> => (
  {status: 200, data}
);

export const clientFormattingErrorResponse = <T>(data: ClientFormattingErrorResponse<T>['data']): ClientFormattingErrorResponse<T> => (
  {status: 400, data: data, message: "Error Parsing Client Data"}
);


export const unauthenticatedResponse = (): ErrorResponse => (
  {status: 401, message: "Unauthenticated Request"}
);


export const unauthorizedResponse = (): ErrorResponse => (
  {status: 403, message: "Unauthorized Request"}
);


export const notFoundResponse = (): ErrorResponse => (
  {status: 404, message: "Resource Not Found"}
);


export const dataConflictResponse = (): ErrorResponse => (
  {status: 409, message: "Conflicting Data Request"}
);


export const internalServerErrorReponse = (): ErrorResponse => (
  {status: 500, message: "Internal Server Error"}
);





