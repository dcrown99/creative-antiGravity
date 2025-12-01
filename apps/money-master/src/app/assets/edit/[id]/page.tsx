import EditAssetClient from './EditAssetClient';

export const dynamic = 'force-dynamic';

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
    return <EditAssetClient params={params} />;
}
