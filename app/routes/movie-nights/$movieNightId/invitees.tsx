import { Invitee } from "@prisma/client";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { db } from "~/utils/db.server";

type LoaderData = { invitees: Array<Invitee> };
export let loader: LoaderFunction = async ({ params }) => {
  const data: LoaderData = {
    invitees: await db.invitee.findMany({
      where: { movieNightId: { equals: params.movieNightId } },
    }),
  };

  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const name = form.get("name");
  const movieNightId = params.movieNightId;

  if (typeof name !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  if (typeof movieNightId !== "string") {
    throw new Error(`Invalid movie night id`);
  }

  const fields = { name, movieNightId };

  await db.invitee.create({ data: fields });

  return redirect(`/movie-nights/${params.movieNightId}/invitees`);
};

export default function InviteesRoute() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData();
  console.log(actionData);

  return (
    <div>
      <h3>Invitees</h3>
      <ul>
        {data.invitees.map((invitee) => (
          <li key={invitee.id}>{invitee.name}</li>
        ))}
      </ul>
      <h4>Invite more</h4>
      <Form method="post" reloadDocument>
        <label>
          Name: <input type="text" name="name" />
        </label>
        <button type="submit">Create</button>
      </Form>
    </div>
  );
}
