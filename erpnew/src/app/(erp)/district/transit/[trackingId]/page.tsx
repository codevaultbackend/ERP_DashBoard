import TransitDetailContent from "../../../../../features/retail/transit/TransitDetailContent";


type PageProps = {
  params: Promise<{
    trackingId: string;
  }>;
};

export default async function TransitDetailsPage({ params }: PageProps) {
  const { trackingId } = await params;

  return (
    <TransitDetailContent
      trackingId={trackingId}
      basePath="/retail/transit"
    />
  );
}