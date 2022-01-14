import { ActionFunction, Form } from "remix";
import { db } from "~/utils/db.server";
import { createUserSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const movieNightName = form.get("movieNightName");

  if (typeof movieNightName !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const movieNightFields = { name: movieNightName };

  const movieNight = await db.movieNight.create({ data: movieNightFields });

  const name = form.get("name");
  if (typeof name !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }
  const inviteeFields = { name, movieNightId: movieNight.id };

  const invitee = await db.invitee.create({ data: inviteeFields });

  return createUserSession(invitee.id, `/movie-nights/${movieNight.id}`);
};

export default function NewMovieNight() {
  return (
    <div>
      <h1>Create a Movie Night</h1>
      <Form method="post" reloadDocument>
        <label>
          Movie Night Name: <input type="text" name="movieNightName" />
        </label>
        <label>
          Your Name: <input type="text" name="name" />
        </label>
        <button type="submit">Create</button>
      </Form>
    </div>
  );
}
