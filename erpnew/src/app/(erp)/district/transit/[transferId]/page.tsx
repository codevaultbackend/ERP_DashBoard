import TransitDetailContent from "@/features/retail/transit/TransitDetailContent";

type PageProps = {
  params: {
    transferId: string;
  };
};

export default function DistrictTransitDetailPage({ params }: PageProps) {
  return (
    <TransitDetailContent
      transferId={params.transferId}
      basePath="/district/transit"
    />
  );
}