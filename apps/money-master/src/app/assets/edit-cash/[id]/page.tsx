import EditCashAssetClient from './EditCashAssetClient';

export const dynamic = 'force-dynamic';

export default function EditCashAssetPage({ params }: { params: Promise<{ id: string }> }) {
    return <EditCashAssetClient params={params} />;
}