import { NavLink, LoaderFunction, useLoaderData, Outlet } from "remix";
import type { Invitee, MovieNight } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getInviteeId } from "~/utils/session.server";
import { Disclosure } from "@headlessui/react";
import logo from "~/images/logo.svg";

type LoaderData = { movieNight: MovieNight; invitee: Invitee };

export const loader: LoaderFunction = async ({ request, params }) => {
  const inviteeId = await getInviteeId(request);
  if (!inviteeId) throw new Error("No invitee id in session");
  const invitee = await db.invitee.findUnique({ where: { id: inviteeId } });
  if (!invitee) throw new Error("Invitee not found");

  const movieNight = await db.movieNight.findUnique({
    where: { id: params.movieNightId },
  });
  if (!movieNight) throw new Error("Movie Night not found");

  const data: LoaderData = { movieNight, invitee };

  return data;
};

export default function MovieNightRoute() {
  const { movieNight, invitee } = useLoaderData<LoaderData>();
  const navigation = [
    {
      name: "Movie Night",
      to: `/movie-nights/${movieNight.id}/`,
    },
    {
      name: "Participants",
      to: `/movie-nights/${movieNight.id}/invitees`,
    },
  ];

  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="block h-12 w-auto" src={logo} />
              </div>
              <div className="-my-px ml-6 flex space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "border-indigo-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center px-1 pt-1 border-b-2 text-md font-medium"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="inline-flex items-center px-1 pt-1 text-md font-medium">
              {invitee.name}
            </div>
          </div>
        </div>
      </Disclosure>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {movieNight.name}
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
