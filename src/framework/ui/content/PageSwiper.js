import {Swiper, SwiperSlide} from 'swiper/react'
import {Virtual} from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/virtual'
import {useSiteContext} from "./Site";
import Page from "./Page";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {useAuth} from "../../auth/AuthProvider";
import {Resource, Permission} from "../../auth/Permissions";
import './PageSwiper.css';

export default function PageSwiper({children}) {

  // imports
  const {outlineData, currentPage} = useSiteContext();
  const navigate = useNavigate();
  const location = useLocation();
  const {hasPermission} = useAuth();

  // states
  const [swipePages, setSwipePages] = useState(/** @type {OutlineData[]} */ []);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (outlineData) {
      setSwipePages(outlineData.filter((page) => !page.PageHidden && !page.HasChildren && (!page.RequiresLogin || hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED))));
    }
  }, [outlineData, setSwipePages, hasPermission]);

  useEffect(() => {
    if (swiperInstance && currentPage) {
      let currentSlideIndex = -1;
      // find a swiper page to display
      swipePages?.forEach((page, index) => {
        if (currentPage.PageID === page.PageID) {
          currentSlideIndex = index;
        }
      });
      if (currentSlideIndex !== -1 && swiperInstance.realIndex !== currentSlideIndex) {
        // swipe to a normal page
        swiperInstance.slideTo(
          currentSlideIndex,
          Math.abs(swiperInstance.realIndex - currentSlideIndex) === 1 ? 500 : 0
        );
      }
    }
  }, [currentPage, swiperInstance, swipePages]);

  // Function to handle slide change and update the URL
  const onSlideChange = (swiper) => {
    const activePage = swipePages[swiper.realIndex];
    if (activePage && location.pathname !== activePage.PageRoute) {
      navigate(activePage.PageRoute);
    }
  };

  return (<>{currentPage?.PageContent ? (
    // meta page, replace swiper with a static page
    <Page pageId={currentPage.PageID}>{children}</Page>
  ) : (
    <Swiper
      modules={[Virtual]}
      speed={600}
      onSwiper={setSwiperInstance}
      onSlideChange={onSlideChange}
      style={{
        margin: 0,
      }}
      virtual
    >
      <>
        {swipePages?.map((page, index) =>
          <SwiperSlide key={page.PageID} virtualIndex={index}>
            <Page pageId={page.PageID}>
              {children}
            </Page>
          </SwiperSlide>
        )}
      </>
    </Swiper>
  )}</>);
}