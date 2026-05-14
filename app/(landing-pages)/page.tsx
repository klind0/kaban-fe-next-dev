import HomeScreen from "@/screens/public-pages/home";
import React from "react";

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomeScreen />
    </React.Suspense>
  );
}
