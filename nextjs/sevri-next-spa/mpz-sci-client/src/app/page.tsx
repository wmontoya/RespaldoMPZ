'use client'
import MainComponent from "@/components/MainComponent";
import { Suspense } from "react";

const Home = () => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainComponent />
    </Suspense>
  );
};

export default Home;
