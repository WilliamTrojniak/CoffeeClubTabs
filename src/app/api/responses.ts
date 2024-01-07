import { ZodFormattedError } from "zod"

type SuccessResponse<T> = {
  status: 200 | 201,
  data: T,
  message?: string
}

type ClientFormattingErrorResponse<T> = {
  status: 400,
  message: ZodFormattedError<T>
}

type ErrorResponse = {
  status: 401 | 403 | 404 | 409 | 500,
  message: string
}

export type Response<T> = SuccessResponse<T> | ClientFormattingErrorResponse<T> | ErrorResponse; 

export const generalClientSuccess = <T>(status: SuccessResponse<T>['status'], data: T): SuccessResponse<T> => (
  {status, data}
);


export const clientFormattingErrorResponse = <T>(data: ClientFormattingErrorResponse<T>['message']): ClientFormattingErrorResponse<T> => (
  {status: 400, message: data}
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





