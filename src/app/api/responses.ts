type SuccessResponse<T> = {
  status: 200 | 201,
  data: T,
}

type ClientErrorResponse = {
  status: 400 | 401 | 403 | 404 | 409,
  data: { message: string } 
}

type ServerErrorResponse = {
  status: 500,
  data: { message: string } 
}

export type Response<T> = SuccessResponse<T> | ClientErrorResponse | ServerErrorResponse;
