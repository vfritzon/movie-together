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

import logo from "~/images/logo.svg";

export default function NewMovieNightRoute() {
  return (
    <>
      <div className="min-h-full flex">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <img className="h-96 w-auto" src={logo} alt="Workflow" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Watch a Movie Together
              </h2>
            </div>

            <div className="mt-8">
              <div className="mt-6">
                <Form reloadDocument method="post" className="space-y-6">
                  <div>
                    <label
                      htmlFor="movieNightName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Event
                    </label>
                    <div className="mt-1">
                      <input
                        id="movieNightName"
                        name="movieNightName"
                        placeholder="Saturday Movie Night"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your name
                    </label>
                    <div className="mt-1">
                      <input
                        placeholder="Bob"
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Create
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
            alt=""
          />
        </div>
      </div>
    </>
  );
}
