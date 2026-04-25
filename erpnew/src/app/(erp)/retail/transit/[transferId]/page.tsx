import TransitDetailContent from "@/features/retail/transit/TransitDetailContent";

type PageProps = {
  params: {
    transferId: string;
  };
};

export default function TransitDetailsPage({ params }: PageProps) {
  return <TransitDetailContent transferId={params.transferId} />;
}