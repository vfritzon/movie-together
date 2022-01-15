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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">
            <span className="text-red-600">{invitee.name}</span>
          </span>
          <span className="block">You're invited</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <Form method="post" className="inline-flex rounded-md shadow">
            <input
              type="hidden"
              name="movieNightId"
              value={invitee.movieNightId}
            />
            <input type="hidden" name="inviteeId" value={invitee.id} />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Let's Go!
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
