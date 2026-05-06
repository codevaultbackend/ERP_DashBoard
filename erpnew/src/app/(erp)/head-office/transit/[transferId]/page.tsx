import TransitDetailContent from "@/features/retail/transit/TransitDetailContent";

type Props = {
  params: Promise<{
    transferId: string;
  }>;
};

export default async function HeadOfficeTransitDetailPage({ params }: Props) {
  const { transferId } = await params;

  return (
    <TransitDetailContent
      transferId={transferId}
      basePath="/head-office/transit"
    />
  );
}