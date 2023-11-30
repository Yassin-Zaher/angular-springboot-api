import { Server } from "./server";

export interface CustomResponse {
      timeStamp: Date;
      statusCode: number;
      message: string;
      status : string;
      reason : string;
      developerMessage: string;
      data : {servers?: Server[], server?: Server}
}