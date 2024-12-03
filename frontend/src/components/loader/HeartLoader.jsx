import React from "react";
import { Hearts } from "react-loader-spinner"; // Correct import

const HeartLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Hearts
        height="80"
        width="80"
        color="#FF69B4"
        ariaLabel="hearts-loading"
        wrapperStyle={{}}
        visible={true}
      />
    </div>
  );
};

export default HeartLoader;
