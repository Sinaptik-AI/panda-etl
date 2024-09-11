import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface CustomViewsPaginatorProps {
  totalElements: number;
  currentIndex: number;
  onChange: (index: number) => void;
}

const CustomViewsPaginator: React.FC<CustomViewsPaginatorProps> = ({
  totalElements,
  currentIndex,
  onChange,
}) => {
  const goToPreviousDocument = () => {
    onChange(Math.max(currentIndex - 1, 0));
  };

  const goToNextDocument = () => {
    onChange(Math.min(currentIndex + 1, totalElements - 1));
  };

  const handleDocChange = (e: any) => {
    if (
      e.target.value &&
      e.target.value !== undefined &&
      e.target.value < totalElements
    ) {
      onChange(Math.max(e.target.value - 1, 0));
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-4">
      <Button onClick={goToPreviousDocument} disabled={currentIndex === 0}>
        <ArrowLeft size={16} />
      </Button>
      <Input
        type="number"
        value={currentIndex + 1}
        onChange={handleDocChange}
        min="1"
        max={Math.max(totalElements, 1)}
        style={{ flex: 1, textAlign: "center", margin: "0 10px" }}
        noMargin
      />
      <Button
        onClick={goToNextDocument}
        disabled={currentIndex === totalElements - 1}
      >
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default CustomViewsPaginator;
