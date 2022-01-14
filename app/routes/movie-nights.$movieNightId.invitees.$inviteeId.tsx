import { Invitee } from "@prisma/client";
import { ActionFunction, Form, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { createUserSession } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fieldErrors?: { username: string | undefined; password: string | undefined };
  fields?: { loginType: string; username: string; password: string };
};
export let action: ActionFunction = async ({
  params,
}): Promise<Response | ActionData> => {
  if (params.inviteeId === undefined) throw new Error("no inviteeId param");
  if (params.movieNightId === undefined)
    throw new Error("no movieNightId id param");

  return createUserSession(
    params.inviteeId,
    `/movie-nights/${params.movieNightId}`
  );
};

type LoaderData = { invitee: Invitee };

export const loader: LoaderFunction = async ({ params }) => {
  const invitee = await db.invitee.findUnique({
    where: { id: params.inviteeId },
  });

  if (!invitee) throw new Error("Invitee not found");

  const data: LoaderData = { invitee };

  return data;
};

export default function InviteeRoute() {
  const { invitee } = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>{invitee.name}, You're invited!</h1>
      <Form method="post">
        <input type="hidden" name="movieNightId" value={invitee.movieNightId} />
        <input type="hidden" name="inviteeId" value={invitee.id} />
        <button type="submit">Let's Go!</button>
      </Form>
    </div>
  );
}
