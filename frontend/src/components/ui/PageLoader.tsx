import React from "react";
import { Loader2 } from "lucide-react";

const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="w-16 h-16 animate-spin" />
  </div>
);
export default PageLoader;
