import { ActionFunction, Form, redirect } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get("name");

  if (typeof name !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const fields = { name };

  const movieNight = await db.movieNight.create({ data: fields });

  return redirect(`/movie-nights/${movieNight.id}`);
};

export default function NewMovieNight() {
  return (
    <div>
      <h1>Create a Movie Night</h1>
      <Form method="post">
        <label>
          Name: <input type="text" name="name" />
        </label>
        <button type="submit">Create</button>
      </Form>
    </div>
  );
}
