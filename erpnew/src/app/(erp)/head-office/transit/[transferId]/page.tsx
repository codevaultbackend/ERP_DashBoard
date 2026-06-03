import HeadTransitDetailContent from "@/features/head-office/transit/HeadTransitDetailContent";
import TransitDetailContent from "@/features/retail/transit/TransitDetailContent";

type Props = {
  params: Promise<{
    transferId: string;
  }>;
};

export default async function HeadOfficeTransitDetailPage({ params }: Props) {
  const { transferId } = await params;

  return (

    <HeadTransitDetailContent
      transferId={transferId}
      basePath="/head-office/transit"
    />
  );
}