import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly log = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const httpResp = isHttp ? exception.getResponse() : null;

    let title = "Internal Server Error";
    let detail = exception instanceof Error ? exception.message : String(exception);
    let errors: Array<{ path: string; message: string }> | undefined;

    if (isHttp && typeof httpResp === "object" && httpResp) {
      const r = httpResp as { message?: unknown; error?: string };
      if (Array.isArray(r.message)) {
        errors = r.message.map((m: string) => ({ path: "", message: m }));
        detail = r.message.join("; ");
      } else if (typeof r.message === "string") {
        detail = r.message;
      }
      if (r.error) title = r.error;
    } else if (isHttp && typeof httpResp === "string") {
      detail = httpResp;
    }

    const problem = {
      type: `https://nimbus.local/errors/${status}`,
      title,
      status,
      detail,
      instance: request?.url ?? "",
      errors,
      requestId: request?.headers?.["x-request-id"] ?? randomUUID(),
    };

    if (status >= 500) {
      this.log.error(`${request?.method} ${request?.url} → ${status}`, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json(problem);
  }
}
