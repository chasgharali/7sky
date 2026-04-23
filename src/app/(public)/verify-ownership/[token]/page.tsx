import VerifyOwnershipClient from "../VerifyOwnershipClient";

export default async function VerifyOwnershipPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <VerifyOwnershipClient
      initialRegistrationNumber={decodeURIComponent(token)}
      autoVerifyOnLoad
    />
  );
}
