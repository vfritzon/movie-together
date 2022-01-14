import { LoaderFunction, useLoaderData, Link, Outlet } from "remix";
import type { Invitee, MovieNight } from "@prisma/client";
import { db } from "~/utils/db.server";
import { getInviteeId } from "~/utils/session.server";

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

  return (
    <div>
      <h1>{movieNight.name}</h1>
      <p>Your name: {invitee.name}</p>
      <Link to={`/movie-nights/${movieNight.id}/invitees`}>Invitees</Link>{" "}
      <Link to={`/movie-nights/${movieNight.id}/`}>Suggestions</Link>
      <Outlet />
    </div>
  );
}
