import React from "react";
import Poster from "./Poster";
import SectionTwo from "./SectionTwo";
import ShopByBrand from "../../brand/components/ShopByBrand";
import HomeFeaturedProducts from "../../product/components/HomeFeaturedProducts";
import StoriesCarousel from "../../stories-widget/components/StoriesCarousel";

const Home = () => {
  return (
    <div>
      <Poster />
      <SectionTwo />
      <ShopByBrand />
      <StoriesCarousel />
      <HomeFeaturedProducts />
    </div>
  );
};

export default Home;
