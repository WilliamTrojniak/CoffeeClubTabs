import { error } from "console"
import { ZodFormattedError } from "zod"

type SuccessResponse<T> = {
  status: 200 | 201,
  data: T,
}

type ClientErrorResponse = {
  data: { message: string },
} & ({
  status: 400,
  data: ZodFormattedError,
} | {
  status: 401 | 403 | 404 | 409,
})

type ServerErrorResponse = {
  status: 500,
  data: { message: string } 
}

export type Response<T> = SuccessResponse<T> | ClientErrorResponse | ServerErrorResponse;

export const generalClientSuccess = <T>(status: SuccessResponse<T>['status'], data: T) => (
  {status, data}
);


export const generalClientErrorResponse = (data: ClientErrorResponse['data']): ClientErrorResponse => (
  {status: 400, data: data}
);


export const unauthenticatedResponse = (): ClientErrorResponse => (
  {status: 401, data: {message: "Unauthenticated Request"}}
);


export const unauthorizedResponse = (): ClientErrorResponse => (
  {status: 403, data: {message: "Unauthorized Request"}}
);


export const notFoundResponse = (): ClientErrorResponse => (
  {status: 404, data: {message: "Resource Not Found"}}
);


export const dataConflictResponse = (): ClientErrorResponse => (
  {status: 409, data: {message: "Conflicting Data Request"}}
);


export const internalServerErrorReponse = (): ServerErrorResponse => (
  {status: 500, data: {message: "Internal Server Error"}}
);





