import {render, screen} from '@testing-library/react';
import {act, useContext, useEffect} from "react";

import Site, {SiteContext} from './Site';

import ReactGA from 'react-ga4';
import RestAPI from "../../api/api.mjs";
import {MemoryRouter} from "react-router";
import {RestApiContext} from "../../api/RestApi";

describe('Site component', () => {

  const mockSiteData = {SiteID: 10};
  const mockOutlineData = [
    {PageID: 50, PageTitle: 'First Page', PageRoute: '/firstpage', ParentID: 0},
    {PageID: 51, PageTitle: 'Second Page', PageRoute: '/secondpage', ParentID: 0}
  ];
  let MockPage;

  beforeEach(() => {
    // set up mock Page component
    MockPage = jest.fn().mockReturnValue((<div data-testid="MockPage"></div>));
  })

  afterEach(() => {
    // clean up spyOn mocks
    jest.restoreAllMocks();
  })

  it('should render Site', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    //then
    const siteElement = screen.getByTestId(/Site/i);
    expect(siteElement).toBeInTheDocument();
  });

  it('should render default Page', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({pageId: 50}, undefined);
  });

  it('should render second Page', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/secondpage']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({pageId: 51}, undefined);
  });

  it('should render page.cfm by page ID', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    const originalLocation = window.location; // Store original location
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: {
        ...originalLocation, // Keep original methods like assign, reload, replace if needed
        pathname: '/page.cfm',
        search: '?pageid=51',
        href: 'http://localhost/page.cfm?pageid=51',
      },
    });

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/page.cfm']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({pageId: 51}, undefined);
  });

  it('should redirect pages for alternate domains', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    const originalLocation = window.location; // Store original location
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: {
        ...originalLocation, // Keep original methods like assign, reload, replace if needed
        pathname: '/',
        search: '',
        href: 'http://www.alternatedomain.com',
        hostname: 'www.alternatedomain.com'
      },
    });

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage} redirects={[{hostname: 'www.alternatedomain.com', pageId: 51}]}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({pageId: 51}, undefined);
  });

  it('should initialize Google Analytics', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    jest.spyOn(ReactGA, 'initialize');
    const gid = 'MyGoogleID'

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site googleId={gid} pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    expect(ReactGA.initialize).toBeCalledWith(gid);
  });

  it('should send 404 error to Page', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/badPath']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({
      "error": {
        "description": "The content you are looking for was not found. Please select a topic on the navigation bar to browse the site.",
        "title": "404 Not Found"
      }
    }, undefined);
  });

  it('should send outline loading error to Page', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockRejectedValue({code: "ERRCODE", status: 400});

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1);
    expect(MockPage).toBeCalledWith({
      "error": {
        "description": "Site data could not be loaded.<br>Code: ERRCODE",
        "title": "400 Server Error"
      }
    }, undefined);
  });

  it('should send site loading error to Page', async () => {
    // given
    const getSite = jest.fn().mockRejectedValue({code: "ERRCODE", status: 400})
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(2); // one successful load, one error
    expect(MockPage).toBeCalledWith({pageId: 50}, undefined);
    expect(MockPage).toBeCalledWith({
      "error": {
        "description": "Site data could not be loaded.<br>Code: ERRCODE",
        "title": "400 Server Error"
      }
    }, undefined);
  });

  it('should report errors from Page', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    MockPage = jest.fn().mockImplementation(() => {
      const siteContext = useContext(SiteContext);
      useEffect(() => {
        console.debug('Reporting error.');
        siteContext.setError({
          title: `Server Error`,
          description: `Site data could not be loaded.`
        })
      }, [siteContext.setError]);
      return (<div data-testid="MockPage"></div>)
    });

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(3); // two successful loads, then error
    expect(MockPage).toBeCalledWith({pageId: 50}, undefined);
    expect(MockPage).toBeCalledWith({
      "error": {
        "description": "Site data could not be loaded.",
        "title": "Server Error"
      }
    }, undefined);
  });

  it('should forward errors from props', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    MockPage = jest.fn().mockImplementation(() => {
      const {error} = useContext(SiteContext);
      errorReceiver(error);
      return (<div data-testid="MockPage"></div>)
    });
    const mockError = {
      title: "Error Title",
      description: "Error Description",
    }
    const errorReceiver = jest.fn();

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage} error={mockError}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(errorReceiver).toBeCalledTimes(2);
    expect(errorReceiver).toBeCalledWith(mockError);
  });

  it('should provide children to Pages', async () => {
    // given
    const getSite = jest.fn().mockResolvedValue(mockSiteData)
    const getSiteOutline = jest.fn().mockResolvedValue(mockOutlineData);
    const reportChildren = jest.fn();
    MockPage = jest.fn().mockImplementation(() => {
      const siteContext = useContext(SiteContext);
      useEffect(() => {
        reportChildren(siteContext.getChildren(0));
      }, [siteContext.getChildren]);
      return (<div data-testid="MockPage"></div>)
    });

    // when
    await act(async () => {
      render(
        <RestApiContext value={{
          getSite: getSite,
          getSiteOutline: getSiteOutline,
        }}>
          <MemoryRouter initialEntries={['/']}>
            <Site pageElement={MockPage}/>
          </MemoryRouter>
        </RestApiContext>
      );
    })

    // then
    const pageElement = screen.getByTestId(/MockPage/i);
    expect(pageElement).toBeInTheDocument();
    expect(MockPage).toBeCalledTimes(1); // two successful loads, then error
    expect(MockPage).toBeCalledWith({pageId: 50}, undefined);
    expect(reportChildren).toBeCalledTimes(1);
    expect(reportChildren).toBeCalledWith(mockOutlineData);
  });

});

