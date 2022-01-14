import { Link } from "remix";

export default function Index() {
  return (
    <div>
      <h1>Movie Together</h1>
      <Link to="/movie-nights/new" prefetch="render">
        Get started
      </Link>
    </div>
  );
}
