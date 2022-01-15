import { Invitee } from "@prisma/client";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
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

  return (
    <div>
      <ul role="list" className="divide-y divide-gray-200">
        {data.invitees.map((invitee) => (
          <li key={invitee.id} className="py-4">
            {invitee.name}{" "}
            <Link
              to={`/movie-nights/${invitee.movieNightId}/invitees/${invitee.id}`}
            >
              {" "}
              - <span className="underline">invite link</span>
            </Link>
          </li>
        ))}
      </ul>
      <Form method="post" reloadDocument>
        <label>
          <div className="mt-1">
            <input
              placeholder="Bob"
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none inline-flex px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex ml-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Invite
            </button>
          </div>
        </label>
      </Form>
      <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1623179007436-1d366e78ba68?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2102&q=80"
          alt=""
        />
      </div>
    </div>
  );
}
