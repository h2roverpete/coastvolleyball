import {useSiteContext} from "./Site";
import {useEffect} from "react";

/**
 * Element to display elements in page head.
 * Needs to be a child of the <Site> tag.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Head() {

  const {siteData, error, currentPage} = useSiteContext();

  useEffect(() => {
    if (siteData?.SiteStyle) {
      const elements = document.head.querySelectorAll('link[rel="stylesheet"]');
      for (const element of elements) {
        if (element.href.startsWith('https://resources.h2rover.net/css/') && element.href !== `https://resources.h2rover.net/css/${siteData.SiteStyle}`) {
          // remove old style sheet from head
          document.head.removeChild(element);
        }
      }
    }
  }, [siteData]);

  return (
    <>
      {siteData?.SiteStyle && (
        <link
          rel={'stylesheet'}
          href={`https://resources.h2rover.net/css/${siteData.SiteStyle}`}
        />
      )}
      {error ? (
        <>
          <title>{error.title}</title>
          <meta name="description" content={error.description}/>
        </>
      ) : (
        <>
          {currentPage && siteData && (<>
            <title>{currentPage.PageMetaTitle ? currentPage.PageMetaTitle : `${siteData.SiteName} - ${currentPage.PageTitle}`}</title>
            <meta name="description" content={currentPage.PageMetaDescription}/>
            <meta name="keywords" content={currentPage.PageMetaKeywords}/>
          </>)}
        </>
      )}</>
  )
}