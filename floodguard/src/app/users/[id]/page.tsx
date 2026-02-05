interface Props {
  params: { id: string };
}

export default function UserProfile({ params }: Props) {
  return (
    <main className="mt-10 text-center">
      <h2 className="text-xl font-bold">User Profile</h2>
      <p>User ID: {params.id}</p>
    </main>
  );
}
