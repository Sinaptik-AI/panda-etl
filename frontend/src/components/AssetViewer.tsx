import { BASE_STORAGE_URL } from "@/constants";
import { AssetData } from "@/interfaces/assets";
import PDFViewer from "./PDFViewer";
import WebsiteViewer from "./WebsiteViewer";

interface AssetViewerProps {
  asset: AssetData | Blob;
  project_id: string | number;
}

const AssetViewer: React.FC<AssetViewerProps> = ({ asset, project_id }) => {
  const get_file = () => {
    if (isAssetData(asset)) {
      return `${BASE_STORAGE_URL}/${project_id}/${asset.filename}`;
    }
  };

  const isAssetData = (asset: any): asset is AssetData => {
    return (asset as AssetData).type !== undefined;
  };

  return (
    <>
      {isAssetData(asset) ? (
        asset.type === "url" ? (
          <WebsiteViewer url={asset.details.url as string} />
        ) : (
          <PDFViewer url={get_file()} />
        )
      ) : (
        <PDFViewer file={asset as Blob} />
      )}
    </>
  );
};

export default AssetViewer;
