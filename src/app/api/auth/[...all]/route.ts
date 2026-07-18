import { handler } from "~/lib/auth-server";

// vinext's response finalizer mutates response headers, but Responses
// returned from fetch() in workerd are immutable. Clone so headers are mutable.
const withMutableHeaders =
  (fn: (request: Request) => Promise<Response>) =>
  async (request: Request) => {
    const response = await fn(request);
    return new Response(response.body, response);
  };

export const GET = withMutableHeaders(handler.GET);
export const POST = withMutableHeaders(handler.POST);
